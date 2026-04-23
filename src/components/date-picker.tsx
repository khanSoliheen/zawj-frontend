// components/DateInput.tsx
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { TouchableOpacity, Platform } from 'react-native';

import Block from './block';
import Input from './input';
import { useData } from '../hooks/useData';

type Props = {
  label: string;
  placeholder?: string;
  value?: string;
  error?: string;
  onChange: (val: string) => void;
  minimumDate?: Date;
  maximumDate?: Date;
};

export default function DateInput({
  label,
  placeholder = 'YYYY-MM-DD',
  value,
  error,
  onChange,
  minimumDate,
  maximumDate = new Date(), // default: today
}: Props) {
  const { theme } = useData();
  const { colors, sizes } = theme;

  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <Block flex={0}>
      {/* Input box that triggers the date picker */}
      <TouchableOpacity onPress={() => setShowDatePicker(prevState => !prevState)}>
        <Input
          label={label}
          placeholder={placeholder}
          value={value}
          editable={false}
          pointerEvents="none"
          error={error}
          marginBottom={sizes.s}
        />
      </TouchableOpacity>

      {/* Native Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          value={value ? new Date(value) : new Date()}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={(_, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              onChange(selectedDate.toISOString().split('T')[0]); // YYYY-MM-DD
            }
          }}
          {...(Platform.OS === 'ios' ? { textColor: colors.text as string } : {})}
        />
      )}
    </Block>
  );
}
