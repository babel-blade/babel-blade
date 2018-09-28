---
title: VSCode Extension
author: swyx
authorURL: http://twitter.com/swyx
authorImageURL: https://pbs.twimg.com/profile_images/990728399873232896/CMPn3IxT_400x400.jpg
---

lets make an extension!

what i want to do is a code lens of sort. relevant links:

- base example: https://github.com/Microsoft/vscode-extension-samples/blob/master/decorator-sample/src/extension.ts
- (most relevant) https://github.com/eamodio/vscode-gitlens/#code-lens (specifically https://github.com/eamodio/vscode-gitlens/blob/806a9f312be3f034ba052a573ed400709a9b6cb3/src/annotations/lineAnnotationController.ts)
- https://github.com/wayou/vscode-todo-highlight
- (maybe) https://marketplace.visualstudio.com/items?itemName=kisstkondoros.vscode-gutter-preview

---

## hello world

I got a thing showing up inline!

```js
const vscode = require("vscode");

// this method is called when vs code is activated
exports.activate = activate;
function activate(context) {
  // create a decorator type that we use to decorate large numbers
  const largeNumberDecorationType = vscode.window.createTextEditorDecorationType(
    {
      //   cursor: "crosshair",
      //   backgroundColor: "rgba(255,0,0,0.3)",
      after: {
        margin: "0 0 0 3em",
        textDecoration: "none"
      },
      rangeBehavior: vscode.DecorationRangeBehavior.OpenOpen
    }
  );

  let activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    triggerUpdateDecorations();
  }

  vscode.window.onDidChangeActiveTextEditor(
    editor => {
      activeEditor = editor;
      if (editor) {
        triggerUpdateDecorations();
      }
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidChangeTextDocument(
    event => {
      if (activeEditor && event.document === activeEditor.document) {
        triggerUpdateDecorations();
      }
    },
    null,
    context.subscriptions
  );

  var timeout = null;
  function triggerUpdateDecorations() {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(updateDecorations, 500);
  }

  function updateDecorations() {
    if (!activeEditor) {
      return;
    }
    // const regEx = /\d+/g;
    // const text = activeEditor.document.getText();
    const largeNumbers = [];
    const scrollable = true;
    const decoration = {
      renderOptions: {
        after: {
          backgroundColor: "red", //new ThemeColor('gitlens.trailingLineBackgroundColor'),
          color: "yellow", //new ThemeColor('gitlens.trailingLineForegroundColor'),
          // contentText: Strings.pad(message.replace(/ /g, GlyphChars.Space), 1, 1),
          contentText: "=============hello world===========",
          fontWeight: "normal",
          fontStyle: "normal"
          // Pull the decoration out of the document flow if we want to be scrollable
          // textDecoration: `none;${scrollable ? "" : " position: absolute;"}`
        }
      }
    };
    decoration.range = new vscode.Range(
      10,
      Number.MAX_SAFE_INTEGER,
      10,
      Number.MAX_SAFE_INTEGER
    );
    largeNumbers.push(decoration);
    activeEditor.setDecorations(largeNumberDecorationType, largeNumbers);
  }
}
```

now to make it multiline

---

## abandoning ship

i realized that theres no way to make this thing multiline - css decoration is inherently limited there.

instead i have to use code lens:

- official docs https://code.visualstudio.com/docs/extensionAPI/language-support#_codelens-show-actionable-context-information-within-source-code
- (rest of the owl tutorial) https://medium.com/@kisstkondoros/typelens-ca3e10f83c66

it's poorly documented and i am realizing i dont have a strong vision of what this looks like. its a good point to just abandon it for now since it wont be as effective a demo as i can do elsewhere.
