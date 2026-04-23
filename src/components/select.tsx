import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';

import Block from './block';
import Button from './button';
import Input from './input';
import Modal from './modal';
import Text from './text';

type Props = {
  label: string;
  placeholder?: string;
  value?: string;
  options: string[];
  error?: string;
  noMarginBottom?: boolean;
  onChange: (val: string) => void;
};

export default function SelectInput({
  label,
  placeholder = 'Select',
  value,
  options,
  error,
  noMarginBottom,
  onChange,
}: Props) {
  const [show, setShow] = useState(false);

  return (
    <Block flex={0}>
      <TouchableOpacity onPress={() => setShow(true)}>
        <Input
          label={label}
          value={value}
          placeholder={placeholder}
          editable={false}
          pointerEvents="none"
          error={error}
          noMarginBottom={noMarginBottom}
        />
      </TouchableOpacity>

      <Modal visible={show} onRequestClose={() => setShow(false)}>
        {options.map((option) => (
          <Button key={option} onPress={() => { onChange(option); setShow(false); }}>
            <Text>{option}</Text>
          </Button>
        ))}
      </Modal>
    </Block>
  );
}
