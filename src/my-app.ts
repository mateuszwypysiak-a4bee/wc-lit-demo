import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";

class Todo {
  id = crypto.randomUUID();
  isCompleted = false;

  constructor(public value: string) {
    this.value = value;
  }

  clone() {
    const clone = new Todo(this.value);
    clone.id = this.id;
    clone.isCompleted = this.isCompleted;
    return clone;
  }

  completeClone() {
    const clone = this.clone();
    clone.isCompleted = true;
    return clone;
  }
}

@customElement("my-app")
export class MyApp extends LitElement {
  @state()
  showCompleted = false;

  toggleCompleted(event: Event) {
    this.showCompleted = (event.target as HTMLInputElement).checked;
  }

  render() {
    return html`
      <label>
        <input type="checkbox" value="true" @change=${this.toggleCompleted}></input>Show completed
      </label>
      <my-todos ?completed=${this.showCompleted}>
      </my-todos>
    `;
    // <p slot="title">TITLE</p>;
  }

  static styles = css`
    :host {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;

      // --color: #27b;
    }
  `;
}

@customElement("my-todos")
export class MyTodos extends LitElement {
  @property({ attribute: "completed", type: Boolean }) // props
  showCompleted = false;

  @state() // state
  todos: Todo[] = [new Todo("todo 1"), new Todo("todo 2")];

  @query("#newTodo") //helper for sth like element ref
  newTodo!: HTMLInputElement; // ! is needed so TS does not cry about missing initializer

  completeTodo(event: Event) {
    const id = (event.target as HTMLButtonElement).closest("li")?.dataset.todo;
    if (!id) {
      return;
    }
    this.todos = this.todos.map((todo) =>
      todo.id === id ? todo.completeClone() : todo
    );
    // const todo = this.todos.find((todo) => todo.id === id);
    // if (!todo) {
    //   return;
    // }
    // todo.isCompleted = true;
    // this.requestUpdate();
  }

  addTodo() {
    const value = this.newTodo.value;
    if (!value) {
      return;
    }
    this.todos = [...this.todos, new Todo(value)];
    // this.todos.push(new Todo(value));
    // this.requestUpdate();
  }

  render() {
    const todos = this.showCompleted
      ? this.todos
      : this.todos.filter((todo) => !todo.isCompleted);
    return html`
      <div>
        <slot name="title">Default Title</slot>
        <label>
          <p>Create new todo</p>
          <input
            id="newTodo"
            name="newTodo"
            type="text"
            placeholder="New Todo"
          />
        </label>
        <button type="button" @click=${this.addTodo}>Add</button>
        <ul>
          ${map(
            todos,
            (todo) =>
              html`<li
                class="todo"
                ?data-completed=${todo.isCompleted}
                data-todo=${todo.id}
              >
                ${todo.value}
                ${!todo.isCompleted
                  ? html`<button type="button" @click=${this.completeTodo}>
                      Done
                    </button>`
                  : ""}
              </li>`
          )}
        </ul>
      </div>
    `;
  }

  static styles = css`
    button {
      background-color: var(--color, buttonface);
    }

    li[data-completed] {
      text-decoration-line: line-through;
      color: var(--color, #777);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "my-app": MyApp;
    "my-todos": MyTodos;
  }
}

// Example:
// native https://tinyurl.com/wc-native
// lit https://tinyurl.com/wc-lit
