/*ЛЕКСИЧЕСКИЙ АНАЛИЗАТОР  (лексер)*/

function lexer(code) {
  let _tokens = code
    //Регулярные выражения
    .replace(/[\n\r]/g, ' *nl* ')
    .replace(/\{.*\}/g, "")
    .split(/[\t\f\v ]+/)
  let tokens = []
  //перебор всех токенов
  for (let i = 0; i < _tokens.length; i++) { 
    let t = _tokens[i]
//определение типа токена, 
//если таковых не имеется выдаётся ошибка
    if (t.length <= 0 || isNaN(t)) {
      if (t === '*nl*') {} 
      else if (t == ':=') {
        tokens.push({
          //оператор присваивания 
          type: 'operatorAssignments', 
          value: t
        })
      } else if (typeof t == 'string' && t != '') {
        tokens.push({
          //слово
          type: 'word',
          value: t
        })
      }
    } else {
      tokens.push({
        //число
        type: 'number',
        value: t
      })
    }
  }
  if (tokens.length < 1) {
    throw 'Токены не найдены.'
  }
  return tokens
}
/*ЛЕКСИЧЕСКИЙ АНАЛИЗАТОР  (лексер)*/


/*СИНТАКСИЧЕСКИЙ АНАЛИЗАТОР (парсер) */
function parser(tokens) {
  function expectedTypeCheck(type, expect) {
    if (Array.isArray(expect)) {
      let i = expect.indexOf(type)
      return i >= 0
    }
    return type === expect
  }
//поиск операндов 
  function findArguments(command, expectedLength, expectedType, currentPosition, currentList) {
    currentPosition = currentPosition || 0
    currentList = currentList || []
    while (expectedLength > currentPosition) {
      let token = tokens.shift()
      //ошибка, кол-во аргументов у вершины
      if (!token) {
        throw command + ' должен иметь ' + expectedLength + ' аргумант(а). '
      }
      if (expectedType) {
        let expected = expectedTypeCheck(token.type, expectedType[currentPosition])
        if (!expected) {
      //ошибка, если неправильно задан тип аргумента
          throw command + ' аргумент должен быть типа ' + JSON.stringify(expectedType[currentPosition]) + '. Аргумент № ' + (currentPosition + 1) + '.'
        }
      }
      let arg = {
        type: token.type,
        value: token.value
      }
      currentList.push(arg)
      currentPosition++
    }
    return currentList
  }

  let AST = {
    type: 'Code',
    body: []
  }
  
  let Prog = false

  while (tokens.length > 0) {
    let current_token = tokens.shift()
    if (current_token.type === 'word') {
      switch (current_token.value) {
        case 'Begin':
        case 'begin':
          var block = {
            type: 'Block Start'
          };
          AST.body.push(block)
          break
        case 'End':
        case 'end':
          var block = {
            type: 'Block End'
          };
          AST.body.push(block)
          break
        case 'Prog':
        case 'prog':
          if (Prog) {
            throw 'Вы можете вызывать Prog только один раз'
          }
          var expression = {
            type: 'CallExpression',
            name: 'Prog',
            arguments: []
          }
          var args = findArguments('Prog', 1, ['word'])
          expression.arguments = expression.arguments.concat(args)
          AST.body.push(expression)
          Prog = true
          break

        case 'Var':
        case 'var':
          var expression = {
            type: 'DeclarationVariable',
            name: 'Var',
            arguments: []
          }
          var args = findArguments('Var', 3, ['word', 'operatorAssignments', 'number'])
          expression.arguments = expression.arguments.concat(args)
          AST.body.push(expression)
          break

        default:
          throw current_token.value + ' такой команды нету!'
      }
    }
  }
  return AST
}
/*СИНТАКСИЧЕСКИЙ АНАЛИЗАТОР (парсер) */