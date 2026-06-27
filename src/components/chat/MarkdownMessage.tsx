import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

interface MarkdownMessageProps {
  content: string
  variant?: 'assistant' | 'user'
}

const assistantComponents: Components = {
  p: ({ children }) => <p className="m-0 mb-3 last:mb-0">{children}</p>,
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900 dark:text-gray-50">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  h1: ({ children }) => (
    <h3 className="mt-4 mb-2 text-base font-semibold first:mt-0">{children}</h3>
  ),
  h2: ({ children }) => (
    <h3 className="mt-4 mb-2 text-base font-semibold first:mt-0">{children}</h3>
  ),
  h3: ({ children }) => (
    <h3 className="mt-4 mb-2 text-sm font-semibold first:mt-0">{children}</h3>
  ),
  ul: ({ children }) => <ul className="my-2 list-disc space-y-1.5 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal space-y-1.5 pl-5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-indigo-300 pl-3 text-gray-600 dark:border-indigo-500 dark:text-gray-300">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-medium text-indigo-600 underline underline-offset-2 hover:opacity-80 dark:text-indigo-400"
    >
      {children}
    </a>
  ),
  code: ({ className, children }) => {
    const isBlock = Boolean(className)

    if (isBlock) {
      return <code className={className}>{children}</code>
    }

    return (
      <code className="rounded bg-gray-200/80 px-1.5 py-0.5 text-[0.9em] dark:bg-gray-900/80">
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto rounded-xl bg-gray-200/70 p-3 text-sm dark:bg-gray-900/70">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-4 border-gray-200 dark:border-gray-600" />,
}

export function MarkdownMessage({ content, variant = 'assistant' }: MarkdownMessageProps) {
  if (variant === 'user') {
    return <p className="m-0 break-words whitespace-pre-wrap">{content}</p>
  }

  return (
    <div className="markdown-message break-words text-[0.95rem] leading-relaxed text-gray-800 dark:text-gray-100">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={assistantComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
