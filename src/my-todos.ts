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

@customElement("my-todos")
export class MyElement extends LitElement {
  @property() // props
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
    return html`
      <div>
        <label>
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
            this.todos,
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
    :host {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }

    li[data-completed] {
      text-decoration-line: line-through;
      color: #777;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "my-todos": MyElement;
  }
}
