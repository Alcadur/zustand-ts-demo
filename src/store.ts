import { create, StoreApi, UseBoundStore } from 'zustand';

/**
 * store types
 */
export type Post = {
    id?: number,
    title: string,
    body: string
}

export type AppStore = {
    numberOfPosts: number,
    posts: Post[],
    setPosts: (posts: Post[]) => void,
    addOnTop: (post: Post) => void,
    updatePost: (post: Post) => void,
}

/**
 * Selectors auto generator
 */
type WithSelectors<S> = S extends { getState: () => infer T }
    ? S & { use: { [K in keyof T]: () => T[K] } }
    : never

const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
    _store: S,
) => {
    let store = _store as WithSelectors<typeof _store>;
    store.use = {};
    for (let k of Object.keys(store.getState())) {
        ;(store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
    }

    return store;
};

/**
 * Base store
 */
const appStoreWithoutSelector = create<AppStore>()((set, get) => ({
    numberOfPosts: 0,
    posts: [],
    setPosts: (posts) => set(state => ({ posts, numberOfPosts: posts.length })),
    addOnTop: (post) => get().setPosts([
        { id: Date.now(), ...post },
        ...get().posts,
    ]),
    updatePost: ({ id: updatedPostId, title, body }) => {
        let postIndex = -1;
        const posts = [...get().posts];
        const post = posts.find(({ id }, index) => {
            const result = updatedPostId === id;

            if (result) {
                postIndex = index;
            }

            return result;
        });

        post!.title = title;
        post!.body = body;
        posts.splice(postIndex, 1, post!)

        get().setPosts(posts)
    },
}));

/**
 * Store with selectors
 */
export const useAppStore = createSelectors(appStoreWithoutSelector);

