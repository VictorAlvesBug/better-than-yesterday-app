export type RequiredKeys<Type extends object> = {
  [Key in keyof Type]-?: {} extends Pick<Type, Key> ? never : Key
}[keyof Type];

export type OnlyDefinedProperties<Type extends object> = Pick<Type, RequiredKeys<Type>>;