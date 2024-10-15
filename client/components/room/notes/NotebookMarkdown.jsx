import React, { useContext, useMemo } from "react";
import Markdown from "react-markdown";
import markdownStyles from "../../../styles/room/notes/markdown-styles.module.css";
import ThemeContext from "../../../contexts/ThemeContext";

import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import tsx from "react-syntax-highlighter/dist/cjs/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/cjs/languages/prism/typescript";
import scss from "react-syntax-highlighter/dist/cjs/languages/prism/scss";
import bash from "react-syntax-highlighter/dist/cjs/languages/prism/bash";
import markdown from "react-syntax-highlighter/dist/cjs/languages/prism/markdown";
import json from "react-syntax-highlighter/dist/cjs/languages/prism/json";
import css from "react-syntax-highlighter/dist/cjs/languages/prism/css";
import c from "react-syntax-highlighter/dist/cjs/languages/prism/c";
import java from "react-syntax-highlighter/dist/cjs/languages/prism/java";
import javascript from "react-syntax-highlighter/dist/cjs/languages/prism/javascript";
import python from "react-syntax-highlighter/dist/cjs/languages/prism/python";
import cpp from "react-syntax-highlighter/dist/cjs/languages/prism/cpp";
import csharp from "react-syntax-highlighter/dist/cjs/languages/prism/csharp";
import go from "react-syntax-highlighter/dist/cjs/languages/prism/go";
import ruby from "react-syntax-highlighter/dist/cjs/languages/prism/ruby";
import swift from "react-syntax-highlighter/dist/cjs/languages/prism/swift";
import kotlin from "react-syntax-highlighter/dist/cjs/languages/prism/kotlin";
import r from "react-syntax-highlighter/dist/cjs/languages/prism/r";
import matlab from "react-syntax-highlighter/dist/cjs/languages/prism/matlab";
import erlang from "react-syntax-highlighter/dist/cjs/languages/prism/erlang";
import haskell from "react-syntax-highlighter/dist/cjs/languages/prism/haskell";
import sql from "react-syntax-highlighter/dist/cjs/languages/prism/sql";
import rust from "react-syntax-highlighter/dist/cjs/languages/prism/rust";

SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("scss", scss);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("markdown", markdown);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("c", c);
SyntaxHighlighter.registerLanguage("java", java);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("cpp", cpp);
SyntaxHighlighter.registerLanguage("csharp", csharp);
SyntaxHighlighter.registerLanguage("go", go);
SyntaxHighlighter.registerLanguage("ruby", ruby);
SyntaxHighlighter.registerLanguage("swift", swift);
SyntaxHighlighter.registerLanguage("kotlin", kotlin);
SyntaxHighlighter.registerLanguage("r", r);
SyntaxHighlighter.registerLanguage("matlab", matlab);
SyntaxHighlighter.registerLanguage("erlang", erlang);
SyntaxHighlighter.registerLanguage("haskell", haskell);
SyntaxHighlighter.registerLanguage("sql", sql);
SyntaxHighlighter.registerLanguage("rust", rust);

import { coldarkDark, duotoneSpace, oneDark, okaidia } from "react-syntax-highlighter/dist/cjs/styles/prism";

const syntaxThemeMap = {
  default: duotoneSpace,
  blackwhite: coldarkDark,
  solaris: oneDark,
  // Add more themes as needed
};

const NotebookMarkdown = ({ content }) => {
  const { theme } = useContext(ThemeContext);

  const syntaxTheme = useMemo(() => syntaxThemeMap[theme] || syntaxThemeMap.default, [theme]);

  const MarkdownComponents = {
    code({ node, inline, className, ...props }) {
      const hasLang = /language-(\w+)/.exec(className || "");
      const hasMeta = node?.data?.meta;

      return hasLang ? (
        <SyntaxHighlighter
          style={syntaxTheme}
          language={hasLang[1]}
          PreTag="div"
          className="codeStyle"
          showLineNumbers={true}
          wrapLines={hasMeta}
          useInlineStyles={true}
        >
          {props.children}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props} />
      );
    },
  };

  return (
    <Markdown
      className={markdownStyles.reactMarkdown}
      components={MarkdownComponents}
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
    >
      {content}
    </Markdown>
  );
};

export default NotebookMarkdown;