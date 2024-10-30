ASSIGN = ":=";
BREAK = "break";
CLASS = "class";
CONTINUE = "continue";
ELSE = "else";
FOR = "for";
FUNCTION = "func";
GREATEREQ = ">=";
IF = "if";
IMPORT = "import";
LESSEQ = "<=";
LET = "let";
NEW = "new";
NOTEQ = "!=";
NULL = "null";
ON = "on";
PARALLEL = "parallel";
RETURN = "return";
WHILE = "while";

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)))
}

function commaSep(rule) {
  return optional(commaSep1(rule))
}

module.exports = grammar({
  name: 'branescript',

  extras: $ => [
    /\s/,
    $.block_comment,
  ],

  rules: {
    // The main entry point for the grammar - must contain at least one statement
    source_file: $ => repeat1($._statement),

    _statement: $ => choice(
      $.attribute,
      $.attribute_inner,
      $.assign_statement,
      $.block_statement,
      $.class_declaration,
      $.expression_statement,
      $.for_statement,
      $.function_declaration,
      $.if_statement,
      $.import_statement,
      $.let_assign_statement,
      $.parallel_statement,
      $.return_statement,
      $.while_statement,
      $.line_comment,
    ),

    // Statement types

    // Attributes
    attribute: $ => seq('#[', $.attribute_key_pair, ']'),
    attribute_inner: $ => seq('#![', $.attribute_list, ']'),
    attribute_key_pair: $ => seq($.identifier, '=', $.literal),
    attribute_list: $ => seq($.identifier, '(', repeat1($.literal), ')'),

    assign_statement: $ => seq($.identifier, ':=', $.expression, ';'),
    // FIXME: ABNF disallows single statements
    block_statement: $ => seq('{', repeat1($._statement), '}'),

    // TODO:
    class_declaration: $ => seq(CLASS, $.identifier, '{', repeat1($.class_statement), '}'),
    class_statement: $ => choice($.property, $.function_declaration),

    property: $ => seq($.identifier, ':', $.identifier, ';'),

    expression_statement: $ => seq($.expression, ';'),

    for_statement: $ => seq(FOR, "(", $.let_assign_statement, $.expression, ';', $.identifier, ASSIGN, $.expression, ')', $.block_statement),

    function_declaration: $ => seq(FUNCTION, $.identifier, '(', optional($.function_arguments), ')', $.block_statement),
    function_arguments: $ => commaSep1($.identifier),

    if_statement: $ => seq(IF, '(', $.expression, ')', $.block_statement, optional(seq(ELSE, $.block_statement))),

    import_statement: $ => seq(IMPORT, $.identifier, ';'),

    let_assign_statement: $ => seq(LET, $.identifier, ASSIGN, $.expression, ';'),

    // TODO: Seems like parallel statements really want to be parallel expressions.
    parallel_statement: $ => choice(
      seq(PARALLEL, optional($.parallel_merge_strategy), '[', $.parallel_blocks, ']', ),
      seq(LET, $.identifier, ASSIGN, PARALLEL, optional($.parallel_merge_strategy), '[', $.parallel_blocks, ']', ';'),
    ),

    parallel_merge_strategy: $ => seq('[', $.identifier, ']'),

    parallel_blocks: $ => commaSep1($.block_statement),

    return_statement: $ => seq('return', $.expression, ';'),

    while_statement: $ => seq(WHILE, '(', $.expression, ')', $.block_statement),

    // Expressions

    expressions: $ => commaSep1($.expression),
    expression: $ => choice(
      seq('(', $.expression, ')'),
      prec.left(1, seq($.expression, $.binary_operation, $.expression)),
      seq($.unary_operation, $.expression),
      $.array,
      $.indexed_array,
      $.call,
      $.identifier,
      $.instance,
      $.literal,
      $.projection,
    ),

    binary_operation: $ => choice( "&&", "=", ">", ">=", "<", "<=", "-", "!=", "||", "%", "+", "/", "*"),

    unary_operation: $ => choice("!", "-"),

    array: $ => seq('[', $.expressions, ']'),
    indexed_array: $ => seq($.array, '[', $.expression, ']'),

    call: $ => seq(choice($.identifier, $.projection), '(', optional($.expressions), ')'),

    projection: $ => choice(
      seq($.identifier, '.', $.projection),
      seq($.identifier, '.', $.identifier),
    ),

    instance: $ => seq(NEW, $.identifier, '(', optional($.instance_properties), ')'),

    instance_properties: $ => commaSep1($.instance_property),
    instance_property: $ => seq($.identifier, ASSIGN, $.expression),

    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
    literal: $ => choice($.boolean, $.integer, "null", $.real, $.string),

    line_comment: $ => seq('//', /[^\n]*/),
    block_comment: $ => token(seq('/*', /.*?\*\//)),

    // Tokens with values
    boolean: $ => /(true,false)/,
    integer: $ => /([0-9]_)+/,
    real: $ => /([0-9]_)*\.([0-9]_)+([eE][+\-]?([0-9]_)+)?/,
    string: $ => /\"([^\"\\]|\\[\"'ntr\\])*\"/
  }
});

