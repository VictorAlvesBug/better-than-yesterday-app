import { getColor } from '@/types/color.type';
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
import Label from './label';

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
         style={{borderColor: getColor("gray-d")}} className="flex flex-row items-center justify-between px-3 py-2 bg-white border rounded-lg"
        onPress={() => setOpen(true)}
      >
        <Text
           style={{color: getColor(selectedOption ? "black" : "gray-7")}}
          numberOfLines={1}
        >
          {selectedOption?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={getColor("gray-7")} />
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
              <Label>{label || 'Selecionar opção'}</Label>
              <Pressable
                className="p-1"
                onPress={() => {
                  setOpen(false);
                  setSearch('');
                }}
              >
                <Ionicons name="close" size={22} color={getColor("gray-7")} />
              </Pressable>
            </View>

            <View style={{borderColor: getColor("gray-d")}} className="flex-row items-center px-3 mb-3 border rounded-lg">
              <Ionicons
                name="search"
                size={16}
                color={getColor("gray-7")}
                style={{ marginRight: 8 }}
              />
              <TextInput
                ref={inputRef}
                className="flex-1 outline-none"
                placeholder="Buscar..."
                placeholderTextColor={getColor("gray-7")}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              ItemSeparatorComponent={() => (
                <View style={{backgroundColor: getColor("gray-d")}} className="h-[1px]" />
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
                      style={{ color: getColor(isSelected ? "violet" : "gray-3") }}
                      className={`text-base ${isSelected
                        ? 'font-bold'
                        : 'black'
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
                  ? (<Text style={{color: getColor("gray-7")}} className="py-4 text-sm text-center">
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
                    }>{`Criar "${search}"`}</Button>
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
