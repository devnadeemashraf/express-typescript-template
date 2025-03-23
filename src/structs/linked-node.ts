/**
 * Generic list node for linked data structures
 * @template T Type of data stored in the node
 */
class LinkedNode<T> {
  private _data: T;
  private _next: LinkedNode<T> | null;

  /**
   * Create a new list node
   * @param data The data to store in this node
   */
  constructor(data: T) {
    this._data = data;
    this._next = null;
  }

  /**
   * Get the data stored in this node
   */
  get data(): T {
    return this._data;
  }

  /**
   * Set the data for this node
   */
  set data(value: T) {
    this._data = value;
  }

  /**
   * Get the next node in the linked structure
   */
  get next(): LinkedNode<T> | null {
    return this._next;
  }

  /**
   * Set the next node in the linked structure
   */
  set next(node: LinkedNode<T> | null) {
    this._next = node;
  }
}

export default LinkedNode;
