<?php
/**
 * Awoof Native Checkout for WooCommerce + Paystack
 * Paste into your child theme's functions.php or include this file from there.
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * CONFIG
 * Better: move this to wp-config.php or an env-based config.
 */
if (!defined('AWOOF_PAYSTACK_SECRET_KEY')) {
    define('AWOOF_PAYSTACK_SECRET_KEY', 'sk_live_xxxxxxxxxxxxxxxxxxxxx'); // replace this
}

if (!defined('AWOOF_PAYSTACK_PUBLIC_NAME')) {
    define('AWOOF_PAYSTACK_PUBLIC_NAME', 'Awoof Checkout');
}

/**
 * REWRITE RULES
 * Flush permalinks after adding this code:
 * WordPress Admin > Settings > Permalinks > Save Changes
 */
add_action('init', function () {
    add_rewrite_rule('^awoof-payment-callback/?$', 'index.php?awoof_payment_callback=1', 'top');
    add_rewrite_rule('^awoof-payment-success/?$', 'index.php?awoof_payment_success=1', 'top');
});

add_filter('query_vars', function ($vars) {
    $vars[] = 'awoof_payment_callback';
    $vars[] = 'awoof_payment_success';
    return $vars;
});

/**
 * REST API ENDPOINTS
 */
add_action('rest_api_init', function () {
    register_rest_route('awoof/v1', '/initialize-payment', array(
        'methods'  => 'POST',
        'callback' => 'awoof_initiate_paystack_payment',
        'permission_callback' => function () {
            return is_user_logged_in();
        },
    ));

    register_rest_route('awoof/v1', '/verify-payment', array(
        'methods'  => 'POST',
        'callback' => 'awoof_rest_verify_payment',
        'permission_callback' => function () {
            return is_user_logged_in();
        },
    ));
});

/**
 * HELPERS
 */
function awoof_get_paystack_secret_key() {
    return defined('AWOOF_PAYSTACK_SECRET_KEY') ? AWOOF_PAYSTACK_SECRET_KEY : '';
}

function awoof_get_user_email_for_payment($user_id, $order) {
    $order_email = ($order instanceof WC_Order) ? $order->get_billing_email() : '';
    if (!empty($order_email)) {
        return $order_email;
    }

    $user = get_userdata($user_id);
    if ($user && !empty($user->user_email)) {
        return $user->user_email;
    }

    return '';
}

function awoof_get_order_id_from_reference($reference) {
    if (preg_match('/^AWF_(\d+)_/', $reference, $matches)) {
        return absint($matches[1]);
    }
    return 0;
}

/**
 * INIT PAYMENT
 * Creates the WooCommerce order and initializes Paystack.
 */
function awoof_initiate_paystack_payment(WP_REST_Request $request) {
    $user_id = get_current_user_id();
    if (!$user_id) {
        return new WP_Error('unauthorized', 'You must be logged in.', array('status' => 401));
    }

    $params = $request->get_json_params();
    $items = isset($params['items']) && is_array($params['items']) ? $params['items'] : array();

    if (empty($items)) {
        return new WP_Error('no_items', 'No items in cart', array('status' => 400));
    }

    $callback_url = home_url('/awoof-payment-callback/');
    $success_url  = home_url('/awoof-payment-success/');

    try {
        $order = wc_create_order(array('customer_id' => $user_id));

        foreach ($items as $item) {
            $product_id = isset($item['id']) ? absint($item['id']) : 0;
            $qty = isset($item['qty']) ? max(1, absint($item['qty'])) : 1;

            if (!$product_id) {
                continue;
            }

            $product = wc_get_product($product_id);
            if ($product) {
                $order->add_product($product, $qty);
            }
        }

        if (!$order->get_items()) {
            return new WP_Error('no_valid_items', 'Unable to add any products to the order.', array('status' => 400));
        }

        $order->calculate_totals();
        $order->set_status('pending');
        $order->update_meta_data('_awoof_checkout_source', 'mobile_app');
        $order->save();
    } catch (Exception $e) {
        return new WP_Error('order_fail', $e->getMessage(), array('status' => 500));
    }

    $reference = 'AWF_' . $order->get_id() . '_' . time();
    $paystack_secret = awoof_get_paystack_secret_key();

    if (empty($paystack_secret)) {
        return new WP_Error('missing_secret', 'Paystack secret key is not configured.', array('status' => 500));
    }

    $response = wp_remote_post('https://api.paystack.co/transaction/initialize', array(
        'headers' => array(
            'Authorization' => 'Bearer ' . $paystack_secret,
            'Content-Type'  => 'application/json',
            'Cache-Control' => 'no-cache',
        ),
        'timeout' => 30,
        'body' => wp_json_encode(array(
            'amount'       => round(((float) $order->get_total()) * 100),
            'email'        => awoof_get_user_email_for_payment($user_id, $order),
            'reference'    => $reference,
            'callback_url' => add_query_arg(array(
                'order_id'  => $order->get_id(),
                'reference' => $reference,
            ), $callback_url),
            'metadata'     => array(
                'order_id' => $order->get_id(),
                'source'   => 'awoof_mobile_app',
            ),
        )),
    ));

    if (is_wp_error($response)) {
        return new WP_Error('paystack_request_failed', $response->get_error_message(), array('status' => 500));
    }

    $status_code = wp_remote_retrieve_response_code($response);
    $body_raw    = wp_remote_retrieve_body($response);
    $body        = json_decode($body_raw);

    if ($status_code < 200 || $status_code >= 300 || empty($body) || empty($body->status) || empty($body->data->access_code)) {
        return new WP_Error(
            'paystack_err',
            'Paystack Init Failed',
            array(
                'status'   => 500,
                'response' => $body_raw,
            )
        );
    }

    $access_code = sanitize_text_field($body->data->access_code);
    $paystack_authorization_url = !empty($body->data->authorization_url)
        ? esc_url_raw($body->data->authorization_url)
        : 'https://checkout.paystack.com/' . $access_code;

    $order->update_meta_data('_awoof_paystack_access_code', $access_code);
    $order->update_meta_data('_awoof_paystack_reference', $reference);
    $order->update_meta_data('_awoof_paystack_authorization_url', $paystack_authorization_url);
    $order->save();

    return array(
        'access_code'       => $access_code,
        'authorization_url' => $paystack_authorization_url,
        'reference'         => $reference,
        'order_id'          => $order->get_id(),
        'callback_url'      => add_query_arg(array(
            'order_id'  => $order->get_id(),
            'reference' => $reference,
        ), $callback_url),
        'success_url'       => add_query_arg(array(
            'order_id'  => $order->get_id(),
            'reference' => $reference,
        ), $success_url),
    );
}

/**
 * VERIFY PAYSTACK
 */
function awoof_verify_paystack_transaction($reference) {
    $reference = sanitize_text_field($reference);
    if (empty($reference)) {
        return new WP_Error('missing_reference', 'Missing payment reference.', array('status' => 400));
    }

    $paystack_secret = awoof_get_paystack_secret_key();
    if (empty($paystack_secret)) {
        return new WP_Error('missing_secret', 'Paystack secret key is not configured.', array('status' => 500));
    }

    $response = wp_remote_get('https://api.paystack.co/transaction/verify/' . rawurlencode($reference), array(
        'headers' => array(
            'Authorization' => 'Bearer ' . $paystack_secret,
            'Content-Type'  => 'application/json',
        ),
        'timeout' => 30,
    ));

    if (is_wp_error($response)) {
        return new WP_Error('verify_request_failed', $response->get_error_message(), array('status' => 500));
    }

    $status_code = wp_remote_retrieve_response_code($response);
    $body_raw    = wp_remote_retrieve_body($response);
    $body        = json_decode($body_raw);

    if ($status_code < 200 || $status_code >= 300 || empty($body) || empty($body->status)) {
        return new WP_Error(
            'verify_failed',
            'Unable to verify payment with Paystack.',
            array(
                'status'   => 500,
                'response' => $body_raw,
            )
        );
    }

    if (empty($body->data) || (($body->data->status ?? '') !== 'success')) {
        return new WP_Error('payment_not_successful', 'Paystack did not return a successful payment status.', array('status' => 400));
    }

    return $body;
}

/**
 * COMPLETE ORDER
 */
function awoof_complete_order_from_paystack($order_id, $reference, $verification_data = null) {
    $order_id  = absint($order_id);
    $reference = sanitize_text_field($reference);

    $order = wc_get_order($order_id);
    if (!$order) {
        return new WP_Error('no_order', 'Order not found.', array('status' => 404));
    }

    if ($order->get_date_paid()) {
        return array(
            'success'      => true,
            'order_id'     => $order->get_id(),
            'reference'    => $reference,
            'redirect_url' => add_query_arg(array(
                'order_id'  => $order->get_id(),
                'reference' => $reference,
            ), home_url('/awoof-payment-success/')),
        );
    }

    $order->set_transaction_id($reference);
    $order->update_meta_data('_awoof_paystack_reference', $reference);
    $order->update_meta_data('_awoof_payment_verified_at', current_time('mysql'));
    $order->update_meta_data('_awoof_payment_source', 'paystack');

    if (is_object($verification_data) && !empty($verification_data->data)) {
        $order->update_meta_data('_awoof_paystack_raw_response', wp_json_encode($verification_data->data));
    }

    $order->payment_complete($reference);
    $order->update_status('processing', 'Paystack payment verified successfully.');
    $order->add_order_note('Paystack payment verified and order marked as paid.');
    $order->save();

    return array(
        'success'      => true,
        'order_id'     => $order->get_id(),
        'reference'    => $reference,
        'redirect_url' => add_query_arg(array(
            'order_id'  => $order->get_id(),
            'reference' => $reference,
        ), home_url('/awoof-payment-success/')),
    );
}

/**
 * CALLBACK + SUCCESS HANDLER
 */
add_action('template_redirect', function () {
    if (get_query_var('awoof_payment_callback')) {
        nocache_headers();

        $order_id  = isset($_GET['order_id']) ? absint($_GET['order_id']) : 0;
        $reference = '';

        if (!empty($_GET['reference'])) {
            $reference = sanitize_text_field(wp_unslash($_GET['reference']));
        } elseif (!empty($_GET['trxref'])) {
            $reference = sanitize_text_field(wp_unslash($_GET['trxref']));
        }

        if (empty($reference) && $order_id) {
            $order = wc_get_order($order_id);
            if ($order) {
                $reference = (string) $order->get_meta('_awoof_paystack_reference');
            }
        }

        if (empty($order_id) && !empty($reference)) {
            $order_id = awoof_get_order_id_from_reference($reference);
        }

        $verification = awoof_verify_paystack_transaction($reference);
        if (is_wp_error($verification)) {
            if ($order_id) {
                $order = wc_get_order($order_id);
                if ($order) {
                    $order->add_order_note('Paystack verification failed: ' . $verification->get_error_message());
                    $order->save();
                }
            }

            status_header(400);
            wp_die(
                esc_html($verification->get_error_message()),
                'Payment Verification Failed',
                array('response' => 400)
            );
        }

        $meta_order_id = 0;
        if (!empty($verification->data->metadata->order_id)) {
            $meta_order_id = absint($verification->data->metadata->order_id);
        }

        $final_order_id = $meta_order_id ?: $order_id;
        $result = awoof_complete_order_from_paystack($final_order_id, $reference, $verification);

        if (is_wp_error($result)) {
            status_header(500);
            wp_die(
                esc_html($result->get_error_message()),
                'Order Completion Failed',
                array('response' => 500)
            );
        }

        wp_safe_redirect($result['redirect_url']);
        exit;
    }

    if (get_query_var('awoof_payment_success')) {
        nocache_headers();
        status_header(200);

        $order_id  = isset($_GET['order_id']) ? absint($_GET['order_id']) : 0;
        $reference = isset($_GET['reference']) ? sanitize_text_field(wp_unslash($_GET['reference'])) : '';
        ?>
        <!doctype html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Payment Successful</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: #f7f7f7;
                    color: #111;
                    display: flex;
                    min-height: 100vh;
                    align-items: center;
                    justify-content: center;
                    margin: 0;
                    padding: 24px;
                    text-align: center;
                }
                .card {
                    background: #fff;
                    border-radius: 16px;
                    padding: 24px;
                    max-width: 480px;
                    width: 100%;
                    box-shadow: 0 10px 30px rgba(0,0,0,.08);
                }
                h1 {
                    margin-top: 0;
                }
                p {
                    line-height: 1.5;
                }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>Payment Successful</h1>
                <p>Your payment has been verified. Order #<?php echo esc_html($order_id ?: 'N/A'); ?> is being processed.</p>
                <?php if (!empty($reference)) : ?>
                    <p>Reference: <?php echo esc_html($reference); ?></p>
                <?php endif; ?>
            </div>
        </body>
        </html>
        <?php
        exit;
    }
});

/**
 * MANUAL VERIFY ENDPOINT
 */
function awoof_rest_verify_payment(WP_REST_Request $request) {
    $params = $request->get_json_params();

    $reference = sanitize_text_field($params['reference'] ?? '');
    $order_id   = absint($params['order_id'] ?? 0);

    if (empty($reference)) {
        return new WP_Error('missing_reference', 'Reference is required.', array('status' => 400));
    }

    $verification = awoof_verify_paystack_transaction($reference);
    if (is_wp_error($verification)) {
        return $verification;
    }

    $meta_order_id = 0;
    if (!empty($verification->data->metadata->order_id)) {
        $meta_order_id = absint($verification->data->metadata->order_id);
    }

    $final_order_id = $meta_order_id ?: $order_id;
    $result = awoof_complete_order_from_paystack($final_order_id, $reference, $verification);

    if (is_wp_error($result)) {
        return $result;
    }

    return rest_ensure_response($result);
}
