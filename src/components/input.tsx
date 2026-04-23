import React, { forwardRef, useCallback, useState } from 'react';
import {
  Image,
  TextInput,
  TextStyle,
  ViewStyle,
  StyleSheet,
  Platform,
  TouchableOpacity,
  NativeSyntheticEvent,
  TargetedEvent,
} from 'react-native';

import Block from './block';
import Text from './text';
import { WEIGHTS } from '../constants/theme';
import { IInputProps } from '../constants/types';
import { useData } from '../hooks/useData';

type Props = IInputProps & {
  error?: string;          // NEW: validation message (optional)
  helperText?: string;     // optional helper line
  /** Set true to remove the default bottom margin */
  noMarginBottom?: boolean;
};

const Input = forwardRef<TextInput, Props>(({
  id = 'Input',
  style,
  color,
  primary,
  secondary,
  tertiary,
  black,
  white,
  gray,
  danger,
  warning,
  success,
  info,
  search,
  disabled,
  label,
  icon,
  marginBottom,
  marginTop,
  marginHorizontal,
  marginVertical,
  marginRight,
  marginLeft,
  onFocus,
  onBlur,
  error,
  helperText,
  editable,
  noMarginBottom,
  ...props
}, ref) => {
  const { theme } = useData();
  const { assets, colors, sizes } = theme;
  const [isFocused, setFocused] = useState(false);

  // compute marginBottom: default to sizes.s unless explicitly set or disabled
  const computedMarginBottom =
    noMarginBottom ? 0 : (typeof marginBottom === 'number' ? marginBottom : sizes.sm);

  const handleFocus = useCallback((event: NativeSyntheticEvent<TargetedEvent>, focus: boolean) => {
    setFocused(focus);
    focus ? onFocus?.(event) : onBlur?.(event);
  }, [onFocus, onBlur]);

  const colorIndex =
    primary ? 'primary' :
      secondary ? 'secondary' :
        tertiary ? 'tertiary' :
          black ? 'black' :
            white ? 'white' :
              gray ? 'gray' :
                danger ? 'danger' :
                  warning ? 'warning' :
                    success ? 'success' :
                      info ? 'info' : null;

  const inputColor = color ?? (colorIndex ? colors?.[colorIndex] : colors.gray);

  const inputBoxStyles = StyleSheet.flatten([
    style,
    {
      minHeight: sizes.inputHeight,
      ...(marginBottom && { marginBottom }),
      ...(marginTop && { marginTop }),
      ...(marginHorizontal && { marginHorizontal }),
      ...(marginVertical && { marginVertical }),
      ...(marginRight && { marginRight }),
      ...(marginLeft && { marginLeft }),
    },
  ]) as ViewStyle;

  const borderColor =
    error ? colors.danger : (isFocused ? colors.focus : inputColor);

  const inputContainerStyles = StyleSheet.flatten([
    {
      minHeight: sizes.inputHeight,
      marginBottom: computedMarginBottom,
      borderRadius: sizes.inputRadius,
      borderWidth: isFocused ? 2 : sizes.inputBorder,
      borderColor,
      backgroundColor: disabled ? colors.card : undefined,
    },
  ]) as ViewStyle;

  const inputStyles = StyleSheet.flatten([
    {
      flex: 1,
      zIndex: 2,
      height: '100%',
      fontSize: sizes.p,
      color: colors.input,
      paddingHorizontal: sizes.inputPadding,
    },
  ]) as TextStyle;

  // testID vs accessibilityLabel
  const inputID =
    Platform.OS === 'android' ? { accessibilityLabel: id } : { testID: id };

  return (
    <Block flex={0} style={inputBoxStyles}>
      {label && (
        <Text bold weight={WEIGHTS.semibold} color={colors.input} marginBottom={sizes.s}>
          {label}
        </Text>
      )}

      <Block
        row
        align="center"
        justify="flex-end"
        style={inputContainerStyles}
        // accessibility
        accessible
        accessibilityRole="text"

        accessibilityState={{ disabled: !!disabled, selected: isFocused }}
      >
        {search && assets.search && (
          <Image
            source={assets.search}
            style={{ marginLeft: sizes.inputPadding, tintColor: colors.icon }}
          />
        )}

        <TextInput
          ref={ref}
          {...inputID}
          {...props}
          style={inputStyles}
          editable={editable}
          placeholderTextColor={inputColor}
          onFocus={(event) => handleFocus(event, true)}
          onBlur={(event) => handleFocus(event, false)}
          accessibilityHint={error ? `Error: ${error}` : undefined}
        />

        {icon && (
          <TouchableOpacity onPress={() => { console.log('Icon pressed'); }}>
            <Image
              source={assets?.[icon]}
              alt={icon}
              style={{ marginRight: sizes.inputPadding, tintColor: colors.icon, }}
            />
          </TouchableOpacity>
        )}

        {(error && assets.warning) ? (
          <Image
            source={assets.warning}
            style={{ marginRight: sizes.s, tintColor: colors.danger }}
          />
        ) : (success && assets.check) ? (
          <Image
            source={assets.check}
            style={{
              width: 12,
              height: 9,
              marginRight: sizes.s,
              tintColor: colors.success,
            }}
          />
        ) : null}
      </Block>

      {
        (error || helperText) && (
          <Text
            bold
            size={sizes.sm}
            marginTop={sizes.s}
            color={colors.danger}
          >
            {error ?? helperText}
          </Text>
        )
      }
    </Block >
  );
});

export default React.memo(Input);
