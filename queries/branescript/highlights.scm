(integer) @number
(real) @number

(call
  (call_arguments
    (identifier) @variable.parameter))

(call
  (identifier) @function.call
)

(call (projection (identifier) @variable.member))

(call
  (projection
    first: (identifier) @variable
    last: (identifier) @function.method.call
  )
)


(boolean) @boolean

(instance
  "new" @keyword)

(string) @string

(instance_property
  key: (identifier) @property)

(instance
  type: (identifier) @type
)

(let_assign_statement
  variable: (identifier) @variable)

(line_comment) @comment
(block_comment) @comment
(return_statement "return" @keyword.return)
(import_statement "import" @keyword.import)

(function_declaration
  "func" @keyword.function
  name: (identifier) @function
  arguments: (function_arguments (identifier) @variable.parameter))

(class_declaration
  "class" @keyword
  name: (identifier) @type
  (property
    field: (identifier) @variable.member
    type: (identifier) @type
  )
)

(if_statement
  ["if" "else"] @keyword

  )

(parallel_statement
  "parallel" @keyword)

(attribute) @attribute
(attribute_inner) @attribute

[
  ","
  "."
  ":"
  ; "::"
  ";"
  ; "->"
  ; "=>"
] @punctuation.delimiter

"let" @keyword

[ "(" ")" "[" "]" "{" "}" ] @punctuation.bracket
