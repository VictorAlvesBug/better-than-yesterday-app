
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
import { Checkin, CreateCheckin } from "@/types/checkin.type";
import { CreateHabit, Habit } from "@/types/habit.type";
import { CreatePlan, ManagePlanMember, Plan, PlanMember } from "@/types/plan.type";
import { CreateUser, User } from "@/types/user.type";
import axios from "axios";
import { toastErrorMessage } from './toastUtils';

export const isSuccessfulStatusCode = (statusCode: number) =>
    statusCode >= 200 && statusCode <= 299;

    const resolveStatus = (status: number) => {
        switch (status) {
            case 0: return 'Failure';
            case 1: return 'Success';
            case 2: return 'Rejected';
            default: return 'Unknown status';
        }
    }

export const logError = (error: unknown) => {
        if (!axios.isAxiosError(error)) {
            console.error('Unexpected error:', error);
            return;
        }
        
        const statusCode = error.response?.status;
        const strResponseData = JSON.stringify(error.response?.data ?? {});
        console.error(`API Error - StatusCode: ${statusCode} - Response Data: ${strResponseData}`);

        if (error.response?.data) {
            const status = resolveStatus(error.response.data.status);
            const reason = error.response.data.reason ?? 'No reason provided';
            toastErrorMessage(`${status}: ${reason}`);
        }
    }

export type ApiResponse<T> = {
    data: T;
    status: number;
    reason?: string;
    rejectionType: number;
}

type ResourceName = 'users' | 'habits' | 'plans' | 'planMembers' | 'checkins';

type ResourceForEntity<TResourceName extends ResourceName> =
    TResourceName extends 'users' ? User :
    TResourceName extends 'habits' ? Habit :
    TResourceName extends 'plans' ? Plan :
    TResourceName extends 'planMembers' ? PlanMember :
    TResourceName extends 'checkins' ? Checkin
    : never;

type ResourceForCreation<TResourceName extends ResourceName> =
    TResourceName extends 'users' ? CreateUser :
    TResourceName extends 'habits' ? CreateHabit :
    TResourceName extends 'plans' ? CreatePlan :
    TResourceName extends 'planMembers' ? ManagePlanMember :
    TResourceName extends 'checkins' ? CreateCheckin
    : never;

function createApi() {
    const getPath = <TResourceName extends ResourceName>
        (
            filter?: Partial<ResourceForEntity<TResourceName>> | undefined
        ) => {
        if (!filter)
            return '';

        const filterItems = Object.entries(filter).map(([fieldName, fieldValue]) =>
            `${fieldName}=${fieldValue}`);

        return `?${filterItems.join('&')}`;

        /*
        const params = new URLSearchParams();
 
        Object.entries(filter).forEach(([fieldName, fieldValue]) => {
            if (fieldValue === undefined || fieldValue === null) return;
 
            params.append(fieldName, String(fieldValue));
        });
 
        const queryString = params.toString();
 
        return queryString ? `?${queryString}` : '';
        */
    };

    const get = async <TResourceName extends ResourceName>
        (
            resourceName: TResourceName,
            filter?: Partial<ResourceForEntity<TResourceName>> | undefined
        ): Promise<ResourceForEntity<TResourceName> | undefined> => {
        try {
            const path = getPath(filter);
            const fullUrl = `${API_URL}/${resourceName}${path}`;
            console.log({ fullUrl });
            const response = await axios.get<ApiResponse<ResourceForEntity<TResourceName>[]>>(fullUrl);
            console.log({ response });

            if (isSuccessfulStatusCode(response.status))
                return response.data.data.length > 0 ? response.data.data[0] : undefined;

            throw new Error(`Erro ao buscar item do recurso '${resourceName}' com parâmetro: '${path}'`);
        } catch (error) {
            logError(error);
            throw error;
        }
    };

    const list = async <TResourceName extends ResourceName>
        (
            resourceName: TResourceName,
            filter?: Partial<ResourceForEntity<TResourceName>> | undefined
        ): Promise<ResourceForEntity<TResourceName>[]> => {
        try {
            const path = getPath(filter);
            const fullUrl = `${API_URL}/${resourceName}${path ?? ''}`;
            console.log({ fullUrl });
            const response = await axios.get<ApiResponse<ResourceForEntity<TResourceName>[]>>(fullUrl);
            console.log({ response });

            if (isSuccessfulStatusCode(response.status))
                return response.data.data;

            throw new Error(`Erro ao listar itens do recurso '${resourceName}' com parâmetro: '${path}'`);
        } catch (error) {
            logError(error);
            throw error;
        }
    };

    const createWithBody = async <TResourceName extends ResourceName>
        (
            resourceName: TResourceName,
            body: ResourceForCreation<TResourceName>
        ): Promise<ResourceForEntity<TResourceName>> => {
        try {
            const fullUrl = `${API_URL}/${resourceName}`;
            console.log({ fullUrl, body });
            const response = await axios.post<ApiResponse<ResourceForEntity<TResourceName>>>(fullUrl, body);
            console.log({ response });

            if (isSuccessfulStatusCode(response.status))
                return response.data.data;

            throw new Error(`Erro ao salvar item do recurso '${resourceName}' com payload: '${JSON.stringify(body)}'`);
        } catch (error) {
            logError(error);
            throw error;
        }
    };

    const createWithPath = async <TResourceName extends ResourceName>
        (
            resourceName: TResourceName,
            path: string
        ): Promise<ResourceForEntity<TResourceName>> => {
        try {
            const fullUrl = `${API_URL}/${resourceName}/${path ?? ''}`;
            console.log({ fullUrl });
            const response = await axios.post<ApiResponse<ResourceForEntity<TResourceName>>>(fullUrl);
            console.log({ response });

            if (isSuccessfulStatusCode(response.status))
                return response.data.data;

            throw new Error(`Erro ao salvar item do recurso '${resourceName}' com path: '${path}'`);
        } catch (error) {
            logError(error);
            throw error;
        }
    };

    /*const update = async <TResourceName extends ResourceName>
    (
        resourceName: TResourceName, 
        body: ResourceFor<TResourceName>
    ): Promise<ResourceFor<TResourceName>> => {
        try {
            const path = getPath({id: body.id});
            const response = await axios.post(`${API_URL}/${resourceName}${path ?? ''}`, body);
            
            if (isSuccessfulStatusCode(response.status))
                return body;
            
            throw new Error(`Erro ao atualizar recurso '${resourceName}' com payload: '${JSON.stringify(body)}'`);
        } catch (error) {
            logError(error);
            throw error;
        }
    };*/

    const deleteWithFilter = async <TResourceName extends ResourceName>
        (
            resourceName: TResourceName,
            filter?: Partial<ResourceForEntity<TResourceName>> | undefined
        ): Promise<void> => {
        try {
            const path = getPath(filter);
            const fullUrl = `${API_URL}/${resourceName}${path ?? ''}`;
            console.log({ fullUrl });
            const responseGet = await axios.get<ApiResponse<ResourceForEntity<TResourceName>[]>>(fullUrl);
            console.log({ responseGet });
            if (!isSuccessfulStatusCode(responseGet.status))
                throw new Error(`Erro ao recuperar itens do recurso '${resourceName}' para deletar, com parâmetro: '${path}'`);

            const tasks = responseGet.data.data.map(async item => {
                const responseDelete = await axios.delete(`${API_URL}/${resourceName}/${item.id}`);

                if (!isSuccessfulStatusCode(responseDelete.status))
                    throw new Error(`Erro ao deletar itens do recurso '${resourceName}' com parâmetro: '?${item.id}'`);
            })

            await Promise.all(tasks);
        } catch (error) {
            logError(error);
            throw error;
        }
    };

    const deleteWithPath = async <TResourceName extends ResourceName>
        (
            resourceName: TResourceName,
            path: string
        ): Promise<void> => {
        try {
            const fullUrl = `${API_URL}/${resourceName}${path ?? ''}`;
            console.log({ fullUrl });
            const responseGet = await axios.get<ApiResponse<ResourceForEntity<TResourceName>[]>>(fullUrl);
            console.log({ responseGet });
            if (!isSuccessfulStatusCode(responseGet.status))
                throw new Error(`Erro ao recuperar itens do recurso '${resourceName}' para deletar, com parâmetro: '${path}'`);

            const tasks = responseGet.data.data.map(async item => {
                const responseDelete = await axios.delete(`${API_URL}/${resourceName}/${item.id}`);

                if (!isSuccessfulStatusCode(responseDelete.status))
                    throw new Error(`Erro ao deletar itens do recurso '${resourceName}' com parâmetro: '?${item.id}'`);
            })

            await Promise.all(tasks);
        } catch (error) {
            logError(error);
            throw error;
        }
    };


    return {
        get,
        list,
        createWithBody,
        createWithPath,
        //update,
        deleteWithFilter,
        deleteWithPath,
    }
}

export const api = createApi();