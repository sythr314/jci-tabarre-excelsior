declare module "react-hook-form" {
  export function useForm<T = any>(options?: any): any;
  export type SubmitHandler<T = any> = (data: T) => any;
  export type UseFormReturn<T = any> = any;
  export type FieldValues = Record<string, any>;
}
declare module "@hookform/resolvers/zod" {
  export function zodResolver(schema: any, schemaOptions?: any, resolverOptions?: any): any;
}
declare module "@sanity/client" {
  export function createClient(config: any): any;
}
declare module "@supabase/ssr" {
  export function createBrowserClient(supabaseUrl: string, supabaseKey: string, options?: any): any;
  export function createServerClient(supabaseUrl: string, supabaseKey: string, options?: any): any;
}
