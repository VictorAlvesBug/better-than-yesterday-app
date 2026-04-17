
/*type MethodType = "GET" | "POST" | "PUT" | "DELETE";

type ResourceName = 'users' | 'habits' | 'plans';

type Path<TResourceName extends ResourceName> = `/${TResourceName}${string}`;

type EndpointProps<
    TResourceName extends ResourceName,
    TMethod extends MethodType,
    TResponse = never,
    TBody = never
> = {
    method: TMethod;
    path: Path<TResourceName>;
    __response?: TResponse;
    __body?: TBody;
};

type Endpoint<TResourceName extends ResourceName> = {
    [s in string]: EndpointProps<TResourceName, MethodType, unknown, unknown>
};

type ResponseOf<T> = T extends EndpointProps<any, any, infer TResponse, any>
    ? TResponse
    : never;

type BodyOf<T> = T extends EndpointProps<any, any, any, infer TBody>
    ? TBody
    : never;

type EndpointCollection<
    TResourceName extends ResourceName,
    TEndpoint extends Endpoint<TResourceName>
> = {
        [E in keyof TEndpoint]: EndpointProps<TResourceName, TEndpoint[E]['method'], unknown, unknown>;
    };

type EndpointCollectionCreator<
    TResourceName extends ResourceName,
    TEndpoint extends Endpoint<TResourceName>
> = (resourceName: TResourceName) => TEndpoint;//EndpointCollection<TResourceName, TEndpoint>;

type HttpClient = <TResponse>(
    method: MethodType,
    path: string,
    body?: unknown
) => Promise<TResponse>;

type Params = Record<string, string | number>;

type ArgsFor<TEndpoint> =
    BodyOf<TEndpoint> extends never
    ? { 
        params?: Params; 
        body?: never;
    }
    : { 
        params?: Params; 
        body?: BodyOf<TEndpoint>; 
    };

type CreateResourceReturnType<
    TResourceName extends ResourceName,
    TEndpoint extends Endpoint<TResourceName>
> = {
        [EC in keyof TEndpoint]: 
            (args?: ArgsFor<TEndpoint[EC]>) => Promise<ResponseOf<TEndpoint[EC]>>;
    };

const request: HttpClient = async <TResponse>(
    method: MethodType,
    path: string,
    body?: unknown
): Promise<TResponse> => {
    const response = await axios.request<TResponse>({
        method,
        url: `${API_URL}${path}`,
        headers: { "Content-Type": "application/json" },
        data: body,
    });

    return response.data;
};

function createResource<
    TResourceName extends ResourceName,
    TEndpoint extends Endpoint<TResourceName>
>(
    resourceName: TResourceName,
    endpointCollectionCreator: EndpointCollectionCreator<TResourceName, TEndpoint>
): CreateResourceReturnType<
    TResourceName,
    EndpointCollection<TResourceName, TEndpoint>
> {
    const endpointCollection = endpointCollectionCreator(resourceName);

    const fillPath = (path: string, params: Params = {}) => {
        return path.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => String(params[key]));
    }

    return Object.fromEntries(
        Object.entries(endpointCollection).map(([name, props]) => [
                name,
                (args?: { params?: Params; body?: unknown }) =>
                    request<ResponseOf<typeof props>>(
                        props.method,
                        fillPath(props.path, args?.params),
                        args?.body
                    ),
            ])
    ) as CreateResourceReturnType<TResourceName, TEndpoint>;
}

type UserEndpoints<TResourceName extends 'users'> = {
    getById: EndpointProps<TResourceName, 'GET', User>;
    listAll: EndpointProps<TResourceName, 'GET', User[]>;
    create: EndpointProps<TResourceName, 'POST', User, CreateUser>;
    update: EndpointProps<TResourceName, 'PUT', User, UpdateUser>;
}

function createUserEndpointCollection<TResourceName extends 'users'>(
    resourceName: TResourceName
): UserEndpoints<TResourceName> {
    return {
        getById: { method: 'GET', path: `/${resourceName}/:id` },
        listAll: { method: 'GET', path: `/${resourceName}` },
        create: { method: 'POST', path: `/${resourceName}` },
        update: { method: 'PUT', path: `/${resourceName}` }
    } as const satisfies Endpoint<TResourceName>;
}

function createDefaultEndpointCollection<TResourceName extends ResourceName>(
    resourceName: TResourceName
) {
    return {
        getById: { method: 'GET', path: `/${resourceName}/:id` },
        listAll: { method: 'GET', path: `/${resourceName}` },
        create: { method: 'POST', path: `/${resourceName}` },
    } as const satisfies Endpoint<TResourceName>;
}

type Api = {
    [RN in ResourceName]: CreateResourceReturnType<RN, Endpoint<RN>>
}

// TODO improve types to validate when resource names doesn't match
const api: Api = {
    users: createResource('users', createUserEndpointCollection),
    habits: createResource('habits', createDefaultEndpointCollection),
    plans: createResource('plans', createDefaultEndpointCollection),
} satisfies Api;

await api.users.listAll();
await api.users.getById({ params: { id: "123" } });
await api.habits.create({ body: { title: "Hello" } });*/

import { API_URL } from '@/src/utils/constants';
import { Checkin } from "@/types/checkin.type";
import { Habit } from "@/types/habit.type";
import { Plan, PlanMember } from "@/types/plan.type";
import { User } from "@/types/user.type";
import axios from "axios";

const isSuccessfulStatusCode = (statusCode: number) => 
    statusCode >= 200 && statusCode <= 299;

type ResourceName = 'users' | 'habits' | 'plans' | 'planMembers' | 'checkins';

type ResourceFor<TResourceName extends ResourceName> = 
    TResourceName extends 'users' ? User :
    TResourceName extends 'habits' ? Habit :
    TResourceName extends 'plans' ? Plan :
    TResourceName extends 'planMembers' ? PlanMember :
    TResourceName extends 'checkins' ? Checkin 
    : never;

function createApi(){

    const getPath = <TResourceName extends ResourceName>
    (
        filter?: Partial<ResourceFor<TResourceName>> | undefined
    ) => {
        if(!filter)
            return '';

        const filterItems = Object.entries(filter).map(([fieldName, fieldValue]) => 
            `${fieldName}=${fieldValue}`);

        return `?${filterItems.join('&')}`;
    };

    const get = async <TResourceName extends ResourceName>
    (
        resourceName: TResourceName, 
        filter?: Partial<ResourceFor<TResourceName>> | undefined
    ): Promise<ResourceFor<TResourceName> | undefined> => {
        try {
            const path = getPath(filter);
            const response = await axios.get<ResourceFor<TResourceName>[]>(`${API_URL}/${resourceName}${path}`);
            
            if (isSuccessfulStatusCode(response.status))
                return response.data.length > 0 ? response.data[0] : undefined;
            
            throw new Error(`Erro ao buscar item do recurso '${resourceName}' com parâmetro: '${path}'`);
        } catch (error) {
            if (axios.isAxiosError(error)){
                console.error('API Error:', error.response?.status, error.response?.data);
            }

            throw error;
        }
    };

    const list = async <TResourceName extends ResourceName>
    (
        resourceName: TResourceName, 
        filter?: Partial<ResourceFor<TResourceName>> | undefined
    ): Promise<ResourceFor<TResourceName>[]> => {
        try {
            const path = getPath(filter);
            const response = await axios.get<ResourceFor<TResourceName>[]>(`${API_URL}/${resourceName}${path ?? ''}`);
            
            if (isSuccessfulStatusCode(response.status))
                return response.data;
            
            throw new Error(`Erro ao listar itens do recurso '${resourceName}' com parâmetro: '${path}'`);
        } catch (error) {
            if (axios.isAxiosError(error)){
                console.error('API Error:', error.response?.status, error.response?.data);
            }

            throw error;
        }
    };

    const create = async <TResourceName extends ResourceName>
    (
        resourceName: TResourceName, 
        body: ResourceFor<TResourceName>
    ): Promise<ResourceFor<TResourceName>> => {
        try {
            const response = await axios.post<PlanMember>(`${API_URL}/${resourceName}`, body);
            
            if (isSuccessfulStatusCode(response.status))
                return body;
            
            throw new Error(`Erro ao salvar item do recurso '${resourceName}' com payload: '${JSON.stringify(body)}'`);
        } catch (error) {
            if (axios.isAxiosError(error)){
                console.error('API Error:', error.response?.status, error.response?.data);
            }

            throw error;
        }
    };

    const remove = async <TResourceName extends ResourceName>
    (
        resourceName: TResourceName, 
        filter?: Partial<ResourceFor<TResourceName>> | undefined
    ): Promise<void> => {
        try {
            const path = getPath(filter);
            const responseGet = await axios.get<ResourceFor<TResourceName>[]>(`${API_URL}/${resourceName}${path ?? ''}`);
            
            if (!isSuccessfulStatusCode(responseGet.status))
                throw new Error(`Erro ao recuperar itens do recurso '${resourceName}' para deletar, com parâmetro: '${path}'`);
            
            const tasks = responseGet.data.map(async item => {
                const responseDelete = await axios.delete(`${API_URL}/${resourceName}/${item.id}`);

                if (!isSuccessfulStatusCode(responseDelete.status))
                    throw new Error(`Erro ao deletar itens do recurso '${resourceName}' com parâmetro: '?${item.id}'`);
            })

            await Promise.all(tasks);
        } catch (error) {
            if (axios.isAxiosError(error)){
                console.error('API Error:', error.response?.status, error.response?.data);
            }

            throw error;
        }
    };


    return {
        get,
        list,
        create,
        delete: remove
    }
}

export const api = createApi();