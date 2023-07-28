import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { when } from "lit/directives/when.js";

type TODO = {
  id: string;
  isCompleted: boolean;
  value: string;
};

class Todo {
  id: string = crypto.randomUUID();
  isCompleted = false;

  constructor(public value: string) {
    this.value = value;
  }

  static from({ id, isCompleted, value }: TODO) {
    const todo = new Todo(value);
    todo.id = id;
    todo.isCompleted = isCompleted;
    return todo;
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

  @state()
  todos!: Todo[];

  connectedCallback() {
    super.connectedCallback();
    const todos = window.localStorage.getItem("todos");
    if (!todos) {
      this.todos = [];
    } else {
      this.todos = JSON.parse(todos).map(Todo.from);
    }
  }

  render() {
    return html`
      <label>
        <input type="checkbox" value="true" @change=${
          this.toggleCompleted
        }></input>Show completed
      </label>
      ${
        this.todos
          ? html`<my-todos
              ?completed=${this.showCompleted}
              todos=${JSON.stringify(this.todos)}
              @add=${this.onAdd}
              @complete=${this.onComplete}
            >
            </my-todos>`
          : ""
      }
    `;
    // <p slot="title">TITLE</p>;
  }

  toggleCompleted(event: Event) {
    this.showCompleted = (event.target as HTMLInputElement).checked;
  }

  onAdd(event: CustomEvent) {
    this.todos = [...this.todos, event.detail.todo];
    this.#save();
  }

  onComplete(event: CustomEvent) {
    const id = event.detail.todoId;
    this.todos = this.todos.map((todo) =>
      todo.id === id ? todo.completeClone() : todo
    );
    // const todo = this.todos.find((todo) => todo.id === id);
    // if (!todo) {
    //   return;
    // }
    // todo.isCompleted = true;
    // this.requestUpdate();
    this.#save();
  }

  #save() {
    window.localStorage.setItem("todos", JSON.stringify(this.todos));
  }

  static styles = css`
    :host {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }
    // --color: #27b;
  `;
}

@customElement("my-todos")
export class MyTodos extends LitElement {
  @property({ attribute: "completed", type: Boolean }) // props
  showCompleted = false;

  @property({ type: Array })
  todos!: Todo[];

  @query("#newTodo") //helper for sth like element ref
  newTodo!: HTMLInputElement; // ! is needed so TS does not cry about missing initializer

  completeTodo(event: Event) {
    const id = (event.target as HTMLButtonElement).closest("li")?.dataset.todo;
    if (!id) {
      return;
    }
    this.dispatchEvent(new CustomEvent("complete", { detail: { todoId: id } }));
  }

  addTodo() {
    const value = this.newTodo.value;
    if (!value) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent("add", { detail: { todo: new Todo(value) } })
    );
    this.newTodo.value = "";
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
                ${when(
                  todo.isCompleted,
                  () => "",
                  () =>
                    html`<button type="button" @click=${this.completeTodo}>
                      Done
                    </button>`
                )}
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
