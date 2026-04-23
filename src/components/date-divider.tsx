import React from 'react';

import Block from './block';
import Text from './text';
import { useData } from '../hooks/useData';

export default function DateDivider({ title }: { title: string }) {
  const { theme } = useData();
  const { sizes, colors } = theme;

  return (
    <Block row align="center" marginVertical={sizes.s} paddingHorizontal={sizes.s}>
      <Block flex={1} height={1} color={colors.light} />
      <Text color={colors.gray} marginHorizontal={sizes.s} size={sizes.s}>
        {title}
      </Text>
      <Block flex={1} height={1} color={colors.light} />
    </Block>
  );
}
