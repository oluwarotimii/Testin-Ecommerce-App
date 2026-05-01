import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, Share } from 'react-native';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DASHBOARD_API_BASE_URL } from '@/services/config';
import { Ionicons } from '@expo/vector-icons';

interface ReferralSystemProps {
  onClose?: () => void;
  initialCode?: string;
}

const ReferralSystem: React.FC<ReferralSystemProps> = ({ onClose, initialCode }) => {
  const colors = useThemeColors();
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState(initialCode || '');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  // Check if referral has already been submitted for this device
  useEffect(() => {
    const checkReferralStatus = async () => {
      try {
        const id = Device.osBuildId || Device.modelId || 'unknown-device';
        setDeviceId(id);

        const submittedReferral = await AsyncStorage.getItem(`referral_submitted_${id}`);
        if (submittedReferral === 'true') {
          setSubmitted(true);
        }

        // Check if there's a pending referral code from a deep link
        if (!referralCode) {
          const pendingCode = await AsyncStorage.getItem('pending_referral_code');
          if (pendingCode) {
            setReferralCode(pendingCode);
          }
        }
      } catch (error) {
        console.error('Error checking referral status:', error);
      }
    };

    checkReferralStatus();
  }, [referralCode]);

  const trackReferral = async () => {
    if (!referralCode.trim()) {
      Alert.alert('Error', 'Please enter a referral code');
      return;
    }

    if (!deviceId) {
      Alert.alert('Error', 'Device ID not available');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${DASHBOARD_API_BASE_URL}/api/referral-events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: referralCode.trim(),
          device_id: deviceId,
          platform: Platform.OS,
          customer_id: user?.id || null,
          customer_email: user?.email || null,
        }),
      });

      const responseText = await response.text();

      // Check if the response is JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        // If it's not JSON, it's likely an HTML error page
        console.error('Non-JSON response received:', responseText);
        throw new Error('Invalid response from server. Please check the API endpoint.');
      }

      if (data.success) {
        setSubmitted(true);
        // Store the submission status in AsyncStorage to prevent future submissions
        await AsyncStorage.setItem(`referral_submitted_${deviceId}`, 'true');
        // Clear pending code
        await AsyncStorage.removeItem('pending_referral_code');
        
        Alert.alert('Success', 'Referral submitted successfully!');
        
        if (onClose) {
          // Call onClose to remove the component from parent
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      } else {
        Alert.alert('Error', data.message || 'Failed to submit referral');
      }
    } catch (error: any) {
      console.error('Referral submission failed:', error);
      Alert.alert('Error', 'Failed to submit referral. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const shareApp = async () => {
    try {
      const appUrl = Platform.OS === 'ios' 
        ? 'https://apps.apple.com/app/femtech' // Replace with actual iOS app URL
        : 'https://play.google.com/store/apps/details?id=com.femtech.femtechmobileapp';
      
      const message = `Check out Femtech Mobile App for the best tech deals! Download here: ${appUrl}`;
      
      await Share.share({
        message,
        url: appUrl,
        title: 'Femtech Mobile App',
      });
    } catch (error) {
      console.error('Error sharing app:', error);
    }
  };

  // If already submitted, show a success message or nothing
  if (submitted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface, alignItems: 'center' }]}>
        <Ionicons name="checkmark-circle" size={64} color={colors.success || '#4CD964'} />
        <Text style={[styles.title, { color: colors.text, marginTop: 16 }]}>Referral Tracked!</Text>
        <Text style={[styles.description, { color: colors.textSecondary, textAlign: 'center' }]}>
          Thank you for being part of our community. Your referral has been successfully recorded.
        </Text>
        <TouchableOpacity
          style={[styles.shareContainer, { backgroundColor: colors.primary + '20' }]}
          onPress={shareApp}
        >
          <Ionicons name="share-social" size={20} color={colors.primary} />
          <Text style={[styles.shareText, { color: colors.primary }]}>Invite Friends</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>Referral Program</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Enter the referral code provided to you to track this installation and earn rewards.
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, {
            color: colors.text,
            borderColor: colors.border,
            backgroundColor: colors.background
          }]}
          placeholder="Enter referral code"
          placeholderTextColor={colors.textSecondary}
          value={referralCode}
          onChangeText={setReferralCode}
          autoCapitalize="characters"
          autoCorrect={false}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: colors.primary }]}
        onPress={trackReferral}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <Text style={[styles.submitButtonText, { color: colors.white }]}>Submit Referral</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.inviteButton, { marginTop: 16 }]} 
        onPress={shareApp}
      >
        <Text style={[styles.inviteButtonText, { color: colors.primary }]}>Don't have a code? Invite friends instead</Text>
      </TouchableOpacity>

      <Text style={[styles.note, { color: colors.textSecondary }]}>
        Note: This will only be tracked once per device installation.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  inviteButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  inviteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  shareContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 20,
    gap: 8,
  },
  shareText: {
    fontWeight: '600',
    fontSize: 14,
  },
  note: {
    fontSize: 12,
    marginTop: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default ReferralSystem;