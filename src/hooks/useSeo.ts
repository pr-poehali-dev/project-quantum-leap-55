import { useEffect } from "react"

interface SeoOptions {
  title: string
  description?: string
  noindex?: boolean
}

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement("meta")
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute("content", content)
}

export function useSeo({ title, description, noindex }: SeoOptions) {
  useEffect(() => {
    document.title = title
    setMeta("property", "og:title", title)
    if (description) {
      setMeta("name", "description", description)
      setMeta("property", "og:description", description)
    }
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow")

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement("link")
      canonical.rel = "canonical"
      document.head.appendChild(canonical)
    }
    canonical.href = "https://skvisota.pro" + window.location.pathname
    setMeta("property", "og:url", canonical.href)
  }, [title, description, noindex])
}

export default useSeo