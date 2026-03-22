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

  const onClose = () => {
    setOpen(false);
    setSearch('');
  }

  useEffect(() => {
    inputRef.current?.focus();
  }, [open]);

  return (
    <View className="w-full">
      {/* Campo “fechado” */}
      <Pressable
        className="relative"
        onPress={() => setOpen(true)}
      >
        <Input
          value={selectedOption?.label}
          onChange={() => { }}
          placeholder={selectedOption?.label ?? placeholder}
          className='pointer-events-none' />
        <Ionicons name="chevron-down" size={18} color={getColor("gray-7")} className='absolute right-0 m-3' />
      </Pressable>

      {/* Modal de busca + lista */}
      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={onClose}
      >
        <Pressable
          onPress={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
          className="justify-end flex-1 bg-black/40">
          <Pressable
            onPress={() => { }}
            android_disableSound={false}
            className={`max-h-[70%] bg-white ro unded-t-2xl p-4`}>
            <View className="flex-row items-center justify-between mb-3">
              <Label>{label || 'Selecionar opção'}</Label>
              <Pressable
                className="p-1"
                onPress={() => {
                  onClose();
                }}
              >
                <Ionicons name="close" size={22} color={getColor("gray-7")} />
              </Pressable>
            </View>

            <View className="relative flex-row items-center mb-3">
              <Ionicons
                name="search"
                size={16}
                color={getColor("gray-7")}
                style={{ marginRight: 8 }}
                className='absolute left-0 m-3'
              />
              <Input
                ref={inputRef}
                className="flex-1 outline-none"
                placeholder="Buscar..."
                value={search}
                onChange={setSearch} />
            </View>

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              ItemSeparatorComponent={() => (
                <View style={{ backgroundColor: getColor("gray-d") }} className="h-[1px]" />
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
                      style={{ color: getColor(isSelected ? "violet" : "gray-3") }}
                      className={`text-base flex-1 ${isSelected
                        ? 'font-bold'
                        : 'black'
                        }`}
                    >
                      {item.label}
                    </Text>
                    {item.justAdded && (
                      <Text
                        style={{color: getColor("gray-7"), borderColor: getColor('gray-7')}}
                        className='text-xs'
                      >Recém-adicionado</Text>
                    )}
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
                  ? (<Text style={{ color: getColor("gray-7") }} className="py-4 text-sm text-center">
                    Nenhum resultado encontrado
                  </Text>)
                  : (
                    <Button action={
                      () => {
                        createOption(search);
                        onChange(search);
                        onClose();
                      }
                    }>{`Criar "${search}"`}</Button>
                  )
                }</>

              }
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
