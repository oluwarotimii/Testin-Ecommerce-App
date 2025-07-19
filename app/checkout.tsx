import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { ArrowLeft, MapPin, CreditCard, Truck, Check } from 'lucide-react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

export default function CheckoutScreen() {
  const router = useRouter();
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState(0);
  const [selectedShipping, setSelectedShipping] = useState(0);
  const [promoCode, setPromoCode] = useState('');

  const addresses = [
    {
      id: 1,
      name: 'Home',
      address: '123 Main St, Apt 4B',
      city: 'New York, NY 10001',
      isDefault: true
    },
    {
      id: 2,
      name: 'Work',
      address: '456 Business Ave, Suite 200',
      city: 'New York, NY 10002',
      isDefault: false
    },
  ];

  const paymentMethods = [
    {
      id: 1,
      type: 'card',
      name: 'Visa ending in 1234',
      icon: '💳',
      isDefault: true
    },
    {
      id: 2,
      type: 'card',
      name: 'Mastercard ending in 5678',
      icon: '💳',
      isDefault: false
    },
    {
      id: 3,
      type: 'paypal',
      name: 'PayPal',
      icon: '🅿️',
      isDefault: false
    },
  ];

  const shippingMethods = [
    {
      id: 1,
      name: 'Standard Shipping',
      time: '5-7 business days',
      price: 0,
      description: 'Free shipping on orders over $50'
    },
    {
      id: 2,
      name: 'Express Shipping',
      time: '2-3 business days',
      price: 9.99,
      description: 'Faster delivery'
    },
    {
      id: 3,
      name: 'Next Day Delivery',
      time: '1 business day',
      price: 19.99,
      description: 'Order by 2 PM for next day delivery'
    },
  ];

  const orderSummary = {
    subtotal: 1547.99,
    shipping: shippingMethods[selectedShipping].price,
    tax: 123.84,
    discount: 0,
    total: 1671.83 + shippingMethods[selectedShipping].price
  };

  const handlePlaceOrder = () => {
    // TODO: Implement order placement logic
    router.push('/order-confirmation');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1D1D1F" />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Shipping Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>Shipping Address</Text>
          </View>
          {addresses.map((address, index) => (
            <TouchableOpacity 
              key={address.id} 
              style={[
                styles.optionCard,
                selectedAddress === index && styles.selectedCard
              ]}
              onPress={() => setSelectedAddress(index)}
            >
              <View style={styles.optionContent}>
                <View style={styles.addressInfo}>
                  <Text style={styles.addressName}>{address.name}</Text>
                  <Text style={styles.addressText}>{address.address}</Text>
                  <Text style={styles.addressText}>{address.city}</Text>
                  {address.isDefault && (
                    <Text style={styles.defaultBadge}>Default</Text>
                  )}
                </View>
                {selectedAddress === index && (
                  <Check size={20} color="#007AFF" />
                )}
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add New Address</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>
          {paymentMethods.map((payment, index) => (
            <TouchableOpacity 
              key={payment.id} 
              style={[
                styles.optionCard,
                selectedPayment === index && styles.selectedCard
              ]}
              onPress={() => setSelectedPayment(index)}
            >
              <View style={styles.optionContent}>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentIcon}>{payment.icon}</Text>
                  <View>
                    <Text style={styles.paymentName}>{payment.name}</Text>
                    {payment.isDefault && (
                      <Text style={styles.defaultBadge}>Default</Text>
                    )}
                  </View>
                </View>
                {selectedPayment === index && (
                  <Check size={20} color="#007AFF" />
                )}
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add New Payment Method</Text>
          </TouchableOpacity>
        </View>

        {/* Shipping Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Truck size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>Shipping Method</Text>
          </View>
          {shippingMethods.map((shipping, index) => (
            <TouchableOpacity 
              key={shipping.id} 
              style={[
                styles.optionCard,
                selectedShipping === index && styles.selectedCard
              ]}
              onPress={() => setSelectedShipping(index)}
            >
              <View style={styles.optionContent}>
                <View style={styles.shippingInfo}>
                  <Text style={styles.shippingName}>{shipping.name}</Text>
                  <Text style={styles.shippingTime}>{shipping.time}</Text>
                  <Text style={styles.shippingDescription}>{shipping.description}</Text>
                </View>
                <View style={styles.shippingPrice}>
                  <Text style={styles.priceText}>
                    {shipping.price === 0 ? 'Free' : `$${shipping.price.toFixed(2)}`}
                  </Text>
                  {selectedShipping === index && (
                    <Check size={20} color="#007AFF" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Promo Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Promo Code</Text>
          <View style={styles.promoContainer}>
            <TextInput
              style={styles.promoInput}
              placeholder="Enter promo code"
              value={promoCode}
              onChangeText={setPromoCode}
            />
            <TouchableOpacity style={styles.applyButton}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${orderSummary.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>
                {orderSummary.shipping === 0 ? 'Free' : `$${orderSummary.shipping.toFixed(2)}`}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>${orderSummary.tax.toFixed(2)}</Text>
            </View>
            {orderSummary.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={[styles.summaryValue, styles.discountValue]}>
                  -${orderSummary.discount.toFixed(2)}
                </Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${orderSummary.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
          <Text style={styles.placeOrderText}>Place Order - ${orderSummary.total.toFixed(2)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  optionCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF10',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  defaultBadge: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    marginTop: 4,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  shippingInfo: {
    flex: 1,
  },
  shippingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  shippingTime: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  shippingDescription: {
    fontSize: 12,
    color: '#8E8E93',
  },
  shippingPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  addButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  promoContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  promoInput: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1D1D1F',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#1D1D1F',
  },
  summaryValue: {
    fontSize: 16,
    color: '#1D1D1F',
  },
  discountValue: {
    color: '#34C759',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  placeOrderButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeOrderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});