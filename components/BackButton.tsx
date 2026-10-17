import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { useThemeColors } from '@/hooks/useColorScheme';



interface BackButtonProps {
    onPress?: () => void;
    style?: ViewStyle;
}

export default function BackButton({ onPress, style }: BackButtonProps) {
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
        <TouchableOpacity onPress={handlePress} style={[styles.button, style]}>
            <ArrowLeftIcon weight="bold" size={24} color={colors.text} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        padding: 8,
    },
});
