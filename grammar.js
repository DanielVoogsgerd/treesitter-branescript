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
    attribute: $ => seq('#[', $.attribute_value, ']'),
    attribute_inner: $ => seq('#![', $.attribute_value, ']'),
    attribute_value: $ => choice($.attribute_key_pair, $.attribute_list),
    attribute_key_pair: $ => seq($.identifier, '=', $.literal),
    attribute_list: $ => seq(field("key", $.identifier), '(', repeat1($.literal), ')'),

    assign_statement: $ => seq($.identifier, ASSIGN, $.expression, ';'),
    block_statement: $ => seq('{', repeat($._statement), '}'),

    class_declaration: $ => seq(CLASS, field("name", $.identifier), '{', repeat1($._class_statement), '}'),
    _class_statement: $ => choice($.property, $.function_declaration, $.line_comment),

    property: $ => seq(field("field", $.identifier), ':', field("type", $.identifier), ';'),

    expression_statement: $ => seq($._expression, ';'),

    for_statement: $ => seq(FOR, "(", $.let_assign_statement, $._expression, ';', $.identifier, ASSIGN, $._expression, ')', $.block_statement),

    function_declaration: $ => seq(FUNCTION, field("name", $.identifier), field("arguments", $.function_arguments), field("body", $.block_statement)),
    function_arguments: $ => seq('(', commaSep($.identifier), ')'),

    if_statement: $ => seq(IF, '(', $._expression, ')', $.block_statement, optional(seq(ELSE, $.block_statement))),

    import_statement: $ => seq(IMPORT, $.identifier, ';'),

    let_assign_statement: $ => seq(LET, field("variable", $.identifier), ASSIGN, field("value", $._expression), ';'),

    // TODO: Seems like parallel statements really want to be parallel expressions.
    parallel_statement: $ => choice(
      seq(PARALLEL, optional($.parallel_merge_strategy), '[', $.parallel_blocks, ']', ),
      seq(LET, $.identifier, ASSIGN, PARALLEL, optional($.parallel_merge_strategy), '[', $.parallel_blocks, ']', ';'),
    ),

    parallel_merge_strategy: $ => seq('[', $.identifier, ']'),

    parallel_blocks: $ => commaSep1($.block_statement),

    return_statement: $ => seq('return', $._expression, ';'),

    while_statement: $ => seq(WHILE, '(', $._expression, ')', $.block_statement),

    // Expressions

    expressions: $ => commaSep1($.expression),
    expression: $ => choice(
      prec(2, $.literal),
      seq('(', $.expression, ')'),
      prec.left(1, seq($.expression, $.binary_operation, $.expression)),
      seq($.unary_operation, $.expression),
      $.array,
      $.indexed_array,
      $.call,
      $.identifier,
      $.instance,
      $.projection,
    ),

    _expressions: $ => commaSep1($._expression),
    _expression: $ => choice(
      prec(2, $.literal),
      seq('(', $._expression, ')'),
      prec.left(1, seq($._expression, $.binary_operation, $._expression)),
      seq($.unary_operation, $._expression),
      $.array,
      $.indexed_array,
      $.call,
      $.identifier,
      $.instance,
      $.projection,
    ),

    binary_operation: $ => choice("&&", "=", ">", ">=", "<", "<=", "-", "!=", "||", "%", "+", "/", "*"),

    unary_operation: $ => choice("!", "-"),

    array: $ => seq('[', commaSep($._expression), ']'),
    indexed_array: $ => seq($.array, '[', $._expression, ']'),

    call: $ => seq(choice(field("function", $.identifier), $.projection), field("arguments", $.call_arguments)),

    call_arguments: $ => seq('(', commaSep($._expression), ')'),

    projection: $ => seq(field('first', $.identifier), repeat(seq('.', $.identifier)), seq('.', field('last', $.identifier))),

    instance: $ => seq(NEW, field("type", $.identifier), '{', optional(field("body", $.instance_properties)), '}'),

    instance_properties: $ => commaSep1($.instance_property),
    instance_property: $ => seq(field("key", $.identifier), ASSIGN, field("value", $.expression)),

    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
    literal: $ => choice(prec(2, $.boolean), $.integer, "null", $.real, $.string),

    line_comment: $ => seq('//', /[^\n]*/),
    block_comment: $ => token(seq('/*', /.*?\*\//)),

    // Tokens with values
    boolean: $ => token(prec(2, /(true|false)/)),
    integer: $ => token(/([0-9_])+/),
    real: $ => token(/([0-9_])*\.([0-9_])+([eE][+\-]?([0-9_])+)?/),
    string: $ => token(/\"([^\"\\]|\\[\"'ntr\\])*\"/)
  }
});

