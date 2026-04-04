import { CreateUser, UpdateUser, User } from "@/types/user.type";
import axios from "axios";
import { API_URL } from "./constants";

type MethodType = "GET" | "POST" | "PUT" | "DELETE";

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
await api.habits.create({ body: { title: "Hello" } });