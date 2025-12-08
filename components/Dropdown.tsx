import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
    Dimensions,
    Platform,
    TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useColorScheme';

interface DropdownProps {
    options: any[];
    selectedValue: any;
    onValueChange: (value: any) => void;
    placeholder?: string;
    labelExtractor?: (item: any) => string;
    keyExtractor?: (item: any) => string;
    renderItem?: (item: any, isSelected: boolean) => React.ReactNode;
}

export default function Dropdown({
    options,
    selectedValue,
    onValueChange,
    placeholder = 'Select an option',
    labelExtractor = (item) => item.label || item.title || item.name || String(item),
    keyExtractor = (item) => item.id || item.value || String(item),
    renderItem
}: DropdownProps) {
    const [visible, setVisible] = useState(false);
    const [dropdownTop, setDropdownTop] = useState(0);
    const [dropdownLeft, setDropdownLeft] = useState(0);
    const [dropdownWidth, setDropdownWidth] = useState(0);
    const buttonRef = useRef<View>(null);
    const colors = useThemeColors();

    const toggleDropdown = () => {
        if (visible) {
            setVisible(false);
        } else {
            openDropdown();
        }
    };

    const openDropdown = () => {
        buttonRef.current?.measure((_fx, _fy, w, h, px, py) => {
            setDropdownTop(py + h);
            setDropdownLeft(px);
            setDropdownWidth(w);
            setVisible(true);
        });
    };

    const handleSelect = (item: any) => {
        onValueChange(item);
        setVisible(false);
    };

    const selectedItem = options.find(item => keyExtractor(item) === (typeof selectedValue === 'object' ? keyExtractor(selectedValue) : selectedValue));
    const displayText = selectedItem ? labelExtractor(selectedItem) : placeholder;

    const renderDropdownItem = ({ item }: { item: any }) => {
        const isSelected = keyExtractor(item) === (typeof selectedValue === 'object' ? keyExtractor(selectedValue) : selectedValue);

        if (renderItem) {
            return (
                <TouchableOpacity
                    style={[styles.item, isSelected && { backgroundColor: colors.primary + '10' }]}
                    onPress={() => handleSelect(item)}
                >
                    {renderItem(item, isSelected)}
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                style={[styles.item, isSelected && { backgroundColor: colors.primary + '10' }]}
                onPress={() => handleSelect(item)}
            >
                <Text style={[styles.itemText, { color: colors.text }, isSelected && { color: colors.primary, fontWeight: '600' }]}>
                    {labelExtractor(item)}
                </Text>
                {isSelected && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View>
            <TouchableOpacity
                ref={buttonRef}
                style={[styles.button, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={toggleDropdown}
            >
                <Text style={[styles.buttonText, { color: selectedItem ? colors.text : colors.textSecondary }]}>
                    {displayText}
                </Text>
                <Ionicons name={visible ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
                <TouchableWithoutFeedback onPress={() => setVisible(false)}>
                    <View style={styles.overlay}>
                        <View
                            style={[
                                styles.dropdown,
                                {
                                    top: dropdownTop,
                                    left: dropdownLeft,
                                    width: dropdownWidth,
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border
                                }
                            ]}
                        >
                            <FlatList
                                data={options}
                                renderItem={renderDropdownItem}
                                keyExtractor={keyExtractor}
                                style={{ maxHeight: 250 }}
                                showsVerticalScrollIndicator={true}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    buttonText: {
        fontSize: 16,
        flex: 1,
    },
    overlay: {
        flex: 1,
    },
    dropdown: {
        position: 'absolute',
        borderRadius: 12,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#eee',
    },
    itemText: {
        fontSize: 16,
    },
});
