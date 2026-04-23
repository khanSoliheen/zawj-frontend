import React from 'react';
import type { ImageSourcePropType } from 'react-native';

import Block from './block';
import Image from './image';
import Text from './text';
import { useData } from '../hooks/useData';

type Props = {
  label: string;
  align?: 'left' | 'right';
  seen?: boolean;
  seenAvatar?: ImageSourcePropType | null;
  avatarOnly?: boolean;
};

export default function TimeStamp({
  label,
  align = 'right',
  seen = false,
  seenAvatar = null,
  avatarOnly = false,
}: Props) {
  const { theme } = useData();
  const { sizes, colors } = theme;
  return (
    <Block
      row
      flex={0}
      align="center"
      justify={align === 'right' ? 'flex-end' : 'flex-start'}
      width="100%"
      marginTop={sizes.xs}
    >
      <Block row flex={0} align="center">
        {!avatarOnly ? (
          <Text
            size={sizes.s}
            color={colors.gray}
            align={align}
          >
            {label}
          </Text>
        ) : null}
        {seen && seenAvatar ? (
          <Block
            row
            flex={0}
            align="center"
            marginLeft={!avatarOnly ? sizes.xs : 0}
          >
            <Image
              source={seenAvatar}
              width={16}
              height={16}
              radius={8}
            />
          </Block>
        ) : null}
      </Block>
    </Block>
  );
}
