import { getColor } from '@/types/color.type';
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
import Icon from './icon';
import Input from './input';
import Label from './label';

type ObjectOption = {
  id: string;
  justAdded?: boolean;
};

type BaseOption = ObjectOption | string;

export const isStringOption = <TObjectOption extends ObjectOption>(
  option: TObjectOption | string
): option is string => {
  return typeof option === 'string'
}

const getIdFromOption = <TBaseOption extends BaseOption>(option: TBaseOption) => {
  if (isStringOption(option)) return option;

  return option.id
}

type SearchableSelectProps<TOption> = {
  formatOptionLabel: (value: TOption) => string;
  options: TOption[];
  label?: string;
  placeholder?: string;
  value?: string | null;
  onChange: (option: TOption) => void;
  createOption?: (name: string) => TOption;
};

export default function SearchableSelect<TBaseOption extends BaseOption>({
  formatOptionLabel,
  options,
  label,
  placeholder = 'Selecione...',
  value,
  onChange,
  createOption,
}: SearchableSelectProps<TBaseOption>) {
  const inputRef = useRef<TextInput | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedOption = options.find((option) => getIdFromOption(option) === value);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const s = search.toLowerCase();
    return options.filter((option) => formatOptionLabel(option).toLowerCase().includes(s));
  }, [options, search, formatOptionLabel]);

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
          value={selectedOption && formatOptionLabel(selectedOption)}
          onChange={() => { }}
          placeholder={(selectedOption && formatOptionLabel(selectedOption)) ?? placeholder}
          className="pointer-events-none"
          icon={{
            name: "chevron-down",
            size: 20,
            position: "right"
          }}
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
            onPress={() => { }}
            android_disableSound={false}
            className="w-full max-w-[420px] rounded-2xl bg-white"
          >
            <View className="max-h-[35vh] p-4 overflow-scroll">
              <View className="flex-row items-center justify-between mb-3">
                <Label>{label || 'Selecionar opção'}</Label>

                <Pressable className="p-1" onPress={onClose}>
                  <Icon
                    name="close"
                    size={22}
                    color={'gray-7'}
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
                  icon={{ name: "search", size: 20, position: "left" }}
                />
              </View>

              <FlatList
                data={filteredOptions}
                keyExtractor={(option) => getIdFromOption(option)}
                keyboardShouldPersistTaps="handled"
                ItemSeparatorComponent={() => (
                  <View
                    className="h-[1px]"
                    style={{ backgroundColor: getColor('gray-d') }}
                  />
                )}
                renderItem={({ item: option }) => {
                  const isSelected = getIdFromOption(option) === value;

                  return (
                    <Pressable
                      className="flex-row items-center justify-between gap-3 px-2 py-3"
                      onPress={() => {
                        onChange(option);
                        onClose();
                      }}
                    >
                      <Text
                        className={`flex-1 text-base ${isSelected ? 'font-bold' : ''
                          }`}
                        style={{
                          color: getColor(isSelected ? 'violet' : 'gray-3'),
                        }}
                      >
                        {formatOptionLabel(option)}
                      </Text>

                      {!isStringOption(option) && option.justAdded && (
                        <Text
                          className="text-xs"
                          style={{ color: getColor('gray-7') }}
                        >
                          Recém-adicionado
                        </Text>
                      )}

                      {isSelected && (
                        <Icon
                          name="checkmark"
                          size={18}
                          color={'violet'}
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
                        const newOption = createOption(search);
                        onChange(newOption);
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
