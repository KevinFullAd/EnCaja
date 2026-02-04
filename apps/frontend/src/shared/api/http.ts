// src/shared/api/http.ts
import { ENV } from "@/app/config/env"

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export class HttpError extends Error {
    status: number
    data: unknown
    constructor(message: string, status: number, data: unknown) {
        super(message)
        this.status = status
        this.data = data
    }
}

type RequestOptions = {
    method?: HttpMethod
    body?: unknown
    token?: string | null
    headers?: Record<string, string>
}

export async function http<T>(path: string, opts: RequestOptions = {}): Promise<T> {
    const base = ENV.API_URL ?? ""

    const url = `${base}${path}`
    console.log("HTTP Request to:", url)

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(opts.headers ?? {}),
    }

    if (opts.token) headers.Authorization = `Bearer ${opts.token}`

    const res = await fetch(url, {
        method: opts.method ?? "GET",
        headers,
        body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    })

    const contentType = res.headers.get("content-type") ?? ""
    const isJson = contentType.includes("application/json")
    const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null)

    if (!res.ok) {
        const message =
            (isJson && (data as any)?.message && String((data as any).message)) || `HTTP ${res.status}`
        throw new HttpError(message, res.status, data)
    }

    return data as T
}
