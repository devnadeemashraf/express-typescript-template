import LinkedNode from "./linked-node";

/**
 * Queue implementation using a linked list
 * @template T Type of elements stored in the queue
 */
export class Queue<T> {
  protected _head: LinkedNode<T> | null;
  protected _tail: LinkedNode<T> | null;
  protected _size: number;

  /**
   * Creates a new queue
   */
  constructor() {
    this._head = null;
    this._tail = null;
    this._size = 0;
  }

  /**
   * Adds an element to the end of the queue
   * @param item Item to enqueue
   * @returns The updated queue size
   */
  enqueue(item: T): number {
    const newNode = new LinkedNode<T>(item);

    if (!this._head) {
      // Queue is empty
      this._head = newNode;
      this._tail = newNode;
    } else {
      // Add to the end
      if (this._tail) {
        this._tail.next = newNode;
        this._tail = newNode;
      }
    }

    return ++this._size;
  }

  /**
   * Removes and returns the element at the front of the queue
   * @returns The item at the front of the queue, or undefined if empty
   */
  dequeue(): T | undefined {
    if (!this._head) {
      return undefined;
    }

    const item = this._head.data;
    this._head = this._head.next;
    this._size--;

    // If we removed the last item, update tail
    if (this._size === 0) {
      this._tail = null;
    }

    return item;
  }

  /**
   * Returns the element at the front of the queue without removing it
   * @returns The item at the front, or undefined if empty
   */
  peek(): T | undefined {
    return this._head?.data;
  }

  /**
   * Checks if the queue is empty
   * @returns True if the queue is empty
   */
  isEmpty(): boolean {
    return this._size === 0;
  }

  /**
   * Gets the current size of the queue
   * @returns Number of elements in the queue
   */
  get size(): number {
    return this._size;
  }

  /**
   * Clears all elements from the queue
   */
  clear(): void {
    this._head = null;
    this._tail = null;
    this._size = 0;
  }

  /**
   * Converts the queue to an array
   * @returns Array containing all elements in queue order (front to back)
   */
  toArray(): T[] {
    const result: T[] = [];
    let current = this._head;

    while (current) {
      result.push(current.data);
      current = current.next;
    }

    return result;
  }

  /**
   * Creates a string representation of the queue
   * @returns String representation of the queue
   */
  toString(): string {
    return `Queue(${this._size}): [${this.toArray().join(", ")}]`;
  }

  /**
   * Iterator for the queue
   */
  *[Symbol.iterator](): Iterator<T> {
    let current = this._head;
    while (current) {
      yield current.data;
      current = current.next;
    }
  }
}

export default Queue;
