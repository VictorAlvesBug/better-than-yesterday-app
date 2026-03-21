import { getColor } from '@/types/common.type';
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
import { Button } from './button';

export type Option = {
  label: string;
  value: string;
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
      {/* Campo “fechado” */}
      <Pressable
         style={{borderColor: getColor("light-secondary")}} className="flex flex-row items-center justify-between px-3 py-2 bg-white border rounded-lg"
        onPress={() => setOpen(true)}
      >
        <Text
           style={{color: getColor(selectedOption? "dark-gray" : "light-gray")}}
          numberOfLines={1}
        >
          {selectedOption?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={getColor("light-gray")} />
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
              <Text style={{ color: getColor("dark-gray") }} className="text-base font-semibold">
                {label || 'Selecionar opção'}
              </Text>
              <Pressable
                className="p-1"
                onPress={() => {
                  setOpen(false);
                  setSearch('');
                }}
              >
                <Ionicons name="close" size={22} color={getColor("gray")} />
              </Pressable>
            </View>

            <View style={{backgroundColor: getColor("light-dark")}} className="flex-row items-center px-3 py-2 mb-3 rounded-lg">
              <Ionicons
                name="search"
                size={18}
                color={getColor("gray")}
                style={{ marginRight: 8 }}
              />
              <TextInput
                ref={inputRef}
                 style={{color: getColor("dark-gray")}}
                className="flex-1 outline-none"
                placeholder="Buscar..."
                placeholderTextColor={getColor("light-gray")}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              ItemSeparatorComponent={() => (
                <View style={{backgroundColor: getColor("light-secondary")}} className="h-[1px]" />
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
                      style={{ color: getColor(isSelected ? "violet" : "dark-gray") }}
                      className={`text-base ${isSelected
                        ? 'font-semibold'
                        : ''
                        }`}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={getColor("violet")}
                      />
                    )}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <>{createOption === undefined
                  ? (<Text style={{color: getColor("gray")}} className="py-4 text-sm text-center">
                    Nenhum resultado encontrado
                  </Text>)
                  : (
                    <Button action={
                      () => {
                        createOption(search);
                        onChange(search);
                        setOpen(false);
                        setSearch('');
                      }
                    } color={"secondary"}>{`Criar "${search}"`}</Button>
                  )
                }</>

              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
