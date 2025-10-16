import type { PageServerLoad }  from "./$types";


export const load: PageServerLoad = async ({ cookies, locals, fetch }) => {

    const result = await fetch('/api/auth/check-token',{
            method: "POST",
            credentials: "include",
        })

    const { success, message } = await result.json();

    if(!success){
        console.log(message)

        return {
            user: null,
            access_token: null
        }
    }

    return {
        user: locals.user,
        access_token: locals.accessToken
    }
}