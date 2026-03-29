import { getColor } from '@/types/color.type';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View
} from 'react-native';
import { Button } from './button';
import Input from './input';
import Label from './label';

export type Option = {
  label: string;
  value: string;
  justAdded?: boolean;
};

type SearchableSelectProps = {
  label?: string;
  placeholder?: string;
  value?: string | null;
  options: Option[];
  onChange: (value: string) => void;
  createOption?: (value: string) => void;
};

export default function SearchableSelect({
  label,
  placeholder = 'Selecione...',
  value,
  options,
  onChange,
  createOption,
}: SearchableSelectProps) {
  const inputRef = useRef<TextInput | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedOption = options.find((o) => o.value === value) || null;

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const s = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(s));
  }, [options, search]);

  const onClose = () => {
    setOpen(false);
    setSearch('');
  };

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <View className="w-full">
      <Pressable onPress={() => setOpen(true)}>
        <Input
          value={selectedOption?.label}
          onChange={() => {}}
          placeholder={selectedOption?.label ?? placeholder}
          className="pointer-events-none"
          icon="chevron-down"
          iconPosition="right"
          typeable={false}
        />
      </Pressable>

      <Modal
        visible={open}
        animationType="fade"
        transparent
        onRequestClose={onClose}
      >
        <Pressable
          onPress={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
          className="items-center justify-start flex-1 px-4 pt-24 bg-black/40"
        >
          <Pressable
            onPress={() => {}}
            android_disableSound={false}
            className="w-full max-w-[420px] rounded-2xl bg-white"
          >
              <View className="max-h-[35vh] p-4 overflow-scroll">
                <View className="flex-row items-center justify-between mb-3">
                  <Label>{label || 'Selecionar opção'}</Label>

                  <Pressable className="p-1" onPress={onClose}>
                    <Ionicons
                      name="close"
                      size={22}
                      color={getColor('gray-7')}
                    />
                  </Pressable>
                </View>

                <View className="flex-row items-center mb-3">
                  <Input
                    ref={inputRef}
                    className="flex-1 outline-none"
                    placeholder="Buscar..."
                    value={search}
                    onChange={setSearch}
                    icon="search"
                    iconPosition="left"
                  />
                </View>

                <FlatList
                  data={filteredOptions}
                  keyExtractor={(item) => item.value}
                  keyboardShouldPersistTaps="handled"
                  ItemSeparatorComponent={() => (
                    <View
                      className="h-[1px]"
                      style={{ backgroundColor: getColor('gray-d') }}
                    />
                  )}
                  renderItem={({ item }) => {
                    const isSelected = item.value === value;

                    return (
                      <Pressable
                        className="flex-row items-center justify-between gap-3 px-2 py-3"
                        onPress={() => {
                          onChange(item.value);
                          onClose();
                        }}
                      >
                        <Text
                          className={`flex-1 text-base ${
                            isSelected ? 'font-bold' : ''
                          }`}
                          style={{
                            color: getColor(isSelected ? 'violet' : 'gray-3'),
                          }}
                        >
                          {item.label}
                        </Text>

                        {item.justAdded && (
                          <Text
                            className="text-xs"
                            style={{ color: getColor('gray-7') }}
                          >
                            Recém-adicionado
                          </Text>
                        )}

                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={18}
                            color={getColor('violet')}
                          />
                        )}
                      </Pressable>
                    );
                  }}
                  ListEmptyComponent={
                    createOption === undefined ? (
                      <Text
                        className="py-4 text-sm text-center"
                        style={{ color: getColor('gray-7') }}
                      >
                        Nenhum resultado encontrado
                      </Text>
                    ) : (
                      <Button
                        action={() => {
                          createOption(search);
                          onChange(search);
                          onClose();
                        }}
                      >
                        {`Criar "${search}"`}
                      </Button>
                    )
                  }
                />
              </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
