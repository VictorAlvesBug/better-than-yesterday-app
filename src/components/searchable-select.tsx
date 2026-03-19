import { TextSize } from '@/types/common.type';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

export type Option = {
  label: string;
  value: string;
};

type SearchableSelectProps = {
  label?: string;
    labelSize?: TextSize;
  placeholder?: string;
  value?: string | null;
  options: Option[];
  onChange: (value: string) => void;
  createOption?: (value: string) => void;
};

export default function SearchableSelect({
  label,
  labelSize = "text-base",
  placeholder = 'Selecione...',
  value,
  options,
  onChange,
  createOption
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

  useEffect(() => {
    inputRef.current?.focus();
  }, [open]);

  return (
    <View className="w-full">
      {label && (
              <Text className={`mb-1 font-semibold text-gray-500 uppercase ${labelSize}`}>
          {label}
        </Text>
      )}

      {/* Campo “fechado” */}
      <Pressable
        className="flex flex-row items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-lg"
        onPress={() => setOpen(true)}
      >
        <Text
          className={
            selectedOption ? 'text-gray-900' : 'text-gray-400'
          }
          numberOfLines={1}
        >
          {selectedOption?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#6b7280" />
      </Pressable>

      {/* Modal de busca + lista */}
      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <View className="justify-end flex-1 bg-black/40">
          <View className="max-h-[70%] bg-white rounded-t-2xl p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-semibold text-gray-800">
                {label || 'Selecionar opção'}
              </Text>
              <Pressable
                className="p-1"
                onPress={() => {
                  setOpen(false);
                  setSearch('');
                }}
              >
                <Ionicons name="close" size={22} color="#6b7280" />
              </Pressable>
            </View>

            <View className="flex-row items-center px-3 py-2 mb-3 bg-gray-100 rounded-lg">
              <Ionicons
                name="search"
                size={18}
                color="#9ca3af"
                style={{ marginRight: 8 }}
              />
              <TextInput
                ref={inputRef}
                className="flex-1 text-gray-800 outline-none"
                placeholder="Buscar..."
                placeholderTextColor="#9ca3af"
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              ItemSeparatorComponent={() => (
                <View className="h-[1px] bg-gray-200" />
              )}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    className="flex-row items-center justify-between px-2 py-3"
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                      setSearch('');
                    }}
                  >
                    <Text
                      className={`text-base ${isSelected
                        ? 'font-semibold text-purple-600'
                        : 'text-gray-800'
                        }`}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color="#7c3aed"
                      />
                    )}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <>{createOption === undefined
                  ? (<Text className="py-4 text-sm text-center text-gray-400">
                    Nenhum resultado encontrado
                  </Text>)
                  : (<Pressable
                    onPress={
                      () => {
                      createOption(search)
                      onChange(search);
                      setOpen(false);
                      setSearch('');
                    }
                    }
                    className="py-4 m-2 text-sm font-semibold text-center text-purple-700 bg-purple-100 border border-purple-700 rounded-2xl">
                    Criar &quot;{search}&quot;
                  </Pressable>)
                }</>

              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
