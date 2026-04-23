import * as Haptics from 'expo-haptics';
import React, { useCallback, useState } from 'react';
import { Platform, Pressable } from 'react-native';

import Block from './block';
import Image from './image';
import { ICheckboxProps } from '../constants/types';
import { useData } from '../hooks/useData';

const Checkbox = ({
  onPress,
  haptic = true,
  id = 'Checkbox',
  ...props
}: ICheckboxProps) => {
  const { theme } = useData();
  const { colors, icons, sizes } = theme;
  const [checked, setChecked] = useState(false);

  const handlePress = useCallback(() => {
    onPress?.(!checked);
    setChecked(!checked);

    /* haptic feedback onPress */
    if (haptic) {
      Haptics.selectionAsync();
    }
  }, [checked, haptic, setChecked, onPress]);

  // generate component testID or accessibilityLabel based on Platform.OS
  const checkboxID =
    Platform.OS === 'android' ? { accessibilityLabel: id } : { testID: id };

  return (
    <Pressable {...checkboxID} hitSlop={sizes.s} onPress={handlePress}>
      <Block
        flex={0}
        align="center"
        justify="center"
        gray={!checked}
        outlined={!checked}
        width={sizes.checkboxWidth}
        height={sizes.checkboxHeight}
        radius={sizes.checkboxRadius}
        gradient={checked ? colors.checkbox : undefined}
        {...props}>
        {checked && (
          <Image
            source={icons.check}
            color={colors.checkboxIcon}
            width={sizes.checkboxIconWidth}
            height={sizes.checkboxIconHeight}
          />
        )}
      </Block>
    </Pressable>
  );
};

export default React.memo(Checkbox);
