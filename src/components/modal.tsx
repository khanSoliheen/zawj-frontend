import React from 'react';
import { StyleSheet, Modal as RNModal, ViewStyle, Platform } from 'react-native';

import Block from './block';
import Button from './button';
import Image from './image';
import { IModalProps } from '../constants/types';
import { useData } from '../hooks/useData';

const Modal = ({
  id = 'Modal',
  children,
  style,
  onRequestClose,
  ...props
}: IModalProps) => {
  const { theme } = useData();
  const { assets, colors, sizes } = theme;
  const modalStyles = StyleSheet.flatten([style, {}]) as ViewStyle;

  // generate component testID or accessibilityLabel based on Platform.OS
  const modalID =
    Platform.OS === 'android' ? { accessibilityLabel: id } : { testID: id };

  return (
    <RNModal
      {...modalID}
      {...props}
      transparent
      style={modalStyles}
      animationType="slide"
      onRequestClose={onRequestClose}>
      <Block justify="flex-end">
        <Block safe card flex={0} color={colors.card}>
          <Button
            top={0}
            right={0}
            position="absolute"
            onPress={onRequestClose}
          >
            <Image source={assets.close} color={colors.text} />
          </Button>
          <Block
            flex={0}
            marginTop={sizes.xxl}
            paddingHorizontal={sizes.padding}>
            {children}
          </Block>
        </Block>
      </Block>
    </RNModal>
  );
};

export default React.memo(Modal);
