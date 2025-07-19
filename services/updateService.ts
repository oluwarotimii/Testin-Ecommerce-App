import * as Updates from 'expo-updates';
import { Alert, Platform } from 'react-native';

class UpdateService {
  private isChecking = false;

  async checkForUpdates(showAlert: boolean = false) {
    if (Platform.OS === 'web' || __DEV__) {
      console.log('Updates not available in development or web');
      return;
    }

    if (this.isChecking) {
      console.log('Update check already in progress');
      return;
    }

    this.isChecking = true;

    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        console.log('Update available');
        
        if (showAlert) {
          Alert.alert(
            'Update Available',
            'A new version of the app is available. Would you like to update now?',
            [
              {
                text: 'Later',
                style: 'cancel',
              },
              {
                text: 'Update',
                onPress: () => this.downloadAndRestart(),
              },
            ]
          );
        } else {
          // Auto-download in background
          await this.downloadAndRestart();
        }
      } else {
        console.log('No updates available');
        if (showAlert) {
          Alert.alert('No Updates', 'You are running the latest version of the app.');
        }
      }
    } catch (error) {
      console.log('Error checking for updates:', error);
      if (showAlert) {
        Alert.alert('Update Error', 'Failed to check for updates. Please try again later.');
      }
    } finally {
      this.isChecking = false;
    }
  }

  async downloadAndRestart() {
    try {
      console.log('Downloading update...');
      await Updates.fetchUpdateAsync();
      
      console.log('Update downloaded, restarting...');
      await Updates.reloadAsync();
    } catch (error) {
      console.log('Error downloading update:', error);
      Alert.alert('Update Error', 'Failed to download update. Please try again later.');
    }
  }

  async forceCheckForUpdates() {
    await this.checkForUpdates(true);
  }

  getUpdateInfo() {
    return {
      updateId: Updates.updateId,
      createdAt: Updates.createdAt,
      runtimeVersion: Updates.runtimeVersion,
      channel: Updates.channel,
      isEmbeddedLaunch: Updates.isEmbeddedLaunch,
      isEmergencyLaunch: Updates.isEmergencyLaunch,
    };
  }
}

export default new UpdateService();