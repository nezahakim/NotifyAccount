import { authStore } from "$lib/stores/auth";
import type { PageLoad } from "./$types";


export const load: PageLoad = async ({ data }) =>{

    authStore.login(data.user, data.access_token)
    
    return {
        user: data?.user,
        access_token: data?.access_token,
    }

}