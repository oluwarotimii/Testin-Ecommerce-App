import { TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useColorScheme';

interface BackButtonProps {
    onPress?: () => void;
}

export default function BackButton({ onPress }: BackButtonProps) {
    const router = useRouter();
    const colors = useThemeColors();

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            router.back();
        }
    };

    return (
        <TouchableOpacity onPress={handlePress} style={styles.button}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        padding: 8,
    },
});
