
import { CourseModule, PracticeExample, PracticeCategory, ConceptTopic } from './types';

// --- CORE COURSE CURRICULUM (PROFESSIONAL LEVEL) ---
export const COURSE_DATA: CourseModule[] = [
  {
    id: 1,
    title: "Pythonic Code & Internals",
    description: "Move beyond syntax. Understand how Python objects work, memory management, and writing idiomatic code using the latest features.",
    topics: [
      {
        title: "The Walrus Operator & Unpacking",
        content: "Assignment expressions (:=) allow you to assign and return a value in the same expression. Extended iterable unpacking (*) offers powerful data manipulation.",
        codeExamples: [
          {
            language: 'python',
            code: `data = [1, 2, 3, 4, 5]\nif (n := len(data)) > 3:\n    print(f"List is too long ({n} elements)")\n\nfirst, *middle, last = data\nprint(f"First: {first}, Middle: {middle}, Last: {last}")`,
            description: "Walrus operator and wildcard unpacking."
          }
        ],
        pitfalls: [
          "Overusing the walrus operator can reduce readability if the expression is complex.",
          "Mutable default arguments in functions (def f(l=[])) are a classic trap; use None instead."
        ]
      },
      {
        title: "Memory: mutable vs immutable",
        content: "Understanding `id()`, `is` vs `==`, and how Python passes references by object. Small integers are cached (interned).",
        codeExamples: [
          {
            language: 'python',
            code: `a = [1, 2, 3]\nb = a\nb.append(4)\nprint(a) # [1, 2, 3, 4] - Reference copy!\n\nx = 256\ny = 256\nprint(x is y) # True (Interning)`,
            description: "Reference behavior."
          }
        ]
      }
    ],
    lab: {
      instruction: "Flatten a nested list of arbitrary depth using recursion and `isinstance`. Do not use external libraries.",
      initialCode: `nested = [1, [2, [3, 4], 5], 6]\n\ndef flatten(lst):\n    # Implement generator logic here\n    pass\n\nprint(list(flatten(nested)))`,
      hint: "Use 'yield from' for recursive calls.",
      solution: `nested = [1, [2, [3, 4], 5], 6]\n\ndef flatten(lst):\n    for item in lst:\n        if isinstance(item, list):\n            yield from flatten(item)\n        else:\n            yield item\n\nprint(list(flatten(nested)))`
    },
    miniProject: {
      instruction: "Implement a deep comparison function `deep_diff(obj1, obj2)` that returns a dict of differences between two complex dictionaries.",
      initialCode: `d1 = {"a": 1, "b": {"x": 10}}\nd2 = {"a": 1, "b": {"x": 20}}\n\ndef deep_diff(a, b):\n    # Logic here\n    pass`,
      hint: "Recursively iterate through keys. Handle missing keys.",
      solution: `d1 = {"a": 1, "b": {"x": 10}}\nd2 = {"a": 1, "b": {"x": 20}, "c": 3}\n\ndef deep_diff(a, b):\n    diffs = {}\n    all_keys = set(a.keys()) | set(b.keys())\n    for k in all_keys:\n        if k not in a: diffs[k] = f"Added: {b[k]}"\n        elif k not in b: diffs[k] = f"Removed: {a[k]}"\n        elif isinstance(a[k], dict) and isinstance(b[k], dict):\n            d = deep_diff(a[k], b[k])\n            if d: diffs[k] = d\n        elif a[k] != b[k]:\n            diffs[k] = f"{a[k]} -> {b[k]}"\n    return diffs\n\nprint(deep_diff(d1, d2))`
    }
  },
  {
    id: 2,
    title: "Advanced Functions & Decorators",
    description: "Master Higher-Order Functions, Closures, and writing robust Decorators that preserve metadata.",
    topics: [
      {
        title: "Decorators & Wraps",
        content: "Decorators are functions that take a function and return a new function. Use `functools.wraps` to preserve the original function's name and docstring.",
        codeExamples: [
          {
            language: 'python',
            code: `import functools\n\ndef debug(func):\n    @functools.wraps(func)\n    def wrapper(*args, **kwargs):\n        print(f"Calling {func.__name__} with {args}, {kwargs}")\n        return func(*args, **kwargs)\n    return wrapper\n\n@debug\ndef add(x, y): return x + y\nadd(2, 3)`,
            description: "A standard logging decorator."
          }
        ]
      },
      {
        title: "Closures & Scope",
        content: "The `nonlocal` keyword allows you to modify variables in the nearest enclosing scope that is not global.",
        codeExamples: [
          {
            language: 'python',
            code: `def make_counter():\n    count = 0\n    def inner():\n        nonlocal count\n        count += 1\n        return count\n    return inner\n\nc = make_counter()\nprint(c(), c())`,
            description: "Closure with state."
          }
        ]
      }
    ],
    lab: {
      instruction: "Create a `@retry(times=3)` decorator that accepts an argument for the number of retries and catches exceptions.",
      initialCode: `def retry(times):\n    # Inner wrapper logic\n    pass\n\n@retry(times=2)\ndef unstable():\n    print("Trying...")\n    raise ValueError("Fail")\n\ntry: unstable()\nexcept: print("Done")`,
      hint: "You need 3 levels of nested functions: the decorator maker, the decorator, and the wrapper.",
      solution: `import functools\n\ndef retry(times):\n    def decorator_retry(func):\n        @functools.wraps(func)\n        def wrapper(*args, **kwargs):\n            for i in range(times):\n                try:\n                    return func(*args, **kwargs)\n                except Exception as e:\n                    print(f"Attempt {i+1} failed: {e}")\n            raise Exception("Max retries exceeded")\n        return wrapper\n    return decorator_retry\n\n@retry(times=3)\ndef test():\n    raise ValueError("Error")\n\ntry: test()\nexcept: print("Stopped")`
    },
    miniProject: {
      instruction: "Implement a simple Event Emitter system using decorators to register listeners.",
      initialCode: `events = {}\ndef on(event_name):\n    # register func to events dict\n    pass\n\ndef trigger(event_name, data):\n    # call all listeners\n    pass`,
      hint: "The decorator should simply add the function to a list in the global dictionary.",
      solution: `listeners = {}\n\ndef on(event):\n    def decorator(func):\n        if event not in listeners: listeners[event] = []\n        listeners[event].append(func)\n        return func\n    return decorator\n\n@on("login")\ndef handle_login(user): print(f"Welcome {user}")\n\n@on("login")\ndef log_login(user): print(f"Log: {user} logged in")\n\ndef trigger(event, data):\n    for f in listeners.get(event, []): f(data)\n\ntrigger("login", "Admin")`
    }
  },
  {
    id: 3,
    title: "Iterators, Generators & Contexts",
    description: "Build memory-efficient pipelines and manage resources cleanly with custom context managers.",
    topics: [
      {
        title: "Generators & Yield",
        content: "Generators maintain state and yield values one at a time. They are memory efficient for large datasets.",
        codeExamples: [
          {
            language: 'python',
            code: `def fib_gen(n):\n    a, b = 0, 1\n    for _ in range(n):\n        yield a\n        a, b = b, a + b\n\nprint(list(fib_gen(10)))`,
            description: "Fibonacci Generator."
          }
        ]
      },
      {
        title: "Context Managers",
        content: "The `with` statement uses `__enter__` and `__exit__`. Alternatively, use `contextlib.contextmanager`.",
        codeExamples: [
          {
            language: 'python',
            code: `from contextlib import contextmanager\n\n@contextmanager\ndef open_tag(name):\n    print(f"<{name}>")\n    yield\n    print(f"</{name}>")\n\nwith open_tag("div"):\n    print("Content")`,
            description: "HTML Tag Context Manager."
          }
        ]
      }
    ],
    lab: {
      instruction: "Create a class-based Context Manager `Timer` that prints the execution time of a code block upon exit.",
      initialCode: `import time\nclass Timer:\n    def __enter__(self):\n        pass\n    def __exit__(self, exc_type, exc_val, exc_tb):\n        pass\n\nwith Timer():\n    sum(range(1000000))`,
      hint: "Capture start time in __enter__, calculate diff in __exit__.",
      solution: `import time\nclass Timer:\n    def __enter__(self):\n        self.start = time.time()\n        return self\n    def __exit__(self, *args):\n        print(f"Elapsed: {time.time() - self.start:.4f}s")\n\nwith Timer():\n    x = [i**2 for i in range(10000)]`
    },
    miniProject: {
      instruction: "Build a generator pipeline. 1. Generate integers. 2. Filter evens. 3. Square them. 4. Convert to string.",
      initialCode: `def integers(n): pass\ndef evens(seq): pass\ndef squares(seq): pass\n# Chain them`,
      hint: "Each function should accept an iterable and 'yield' results.",
      solution: `def integers(n):\n    for i in range(n): yield i\n\ndef evens(seq):\n    for x in seq:\n        if x % 2 == 0: yield x\n\ndef squares(seq):\n    for x in seq: yield x**2\n\npipeline = squares(evens(integers(10)))\nprint(list(pipeline))`
    }
  },
  {
    id: 4,
    title: "OOP Mastery & Metaclasses",
    description: "Deep dive into Python's object model, Dunder methods, Slots, and Metaclasses.",
    topics: [
      {
        title: "Magic Methods (Dunders)",
        content: "Customize object behavior with `__str__`, `__repr__`, `__len__`, `__getitem__`, `__call__`.",
        codeExamples: [
          {
            language: 'python',
            code: `class Vector:\n    def __init__(self, x, y): self.x, self.y = x, y\n    def __add__(self, other):\n        return Vector(self.x + other.x, self.y + other.y)\n    def __repr__(self): return f"V({self.x}, {self.y})"\n\nprint(Vector(1, 2) + Vector(3, 4))`,
            description: "Operator overloading."
          }
        ]
      },
      {
        title: "__slots__",
        content: "Use `__slots__` to save memory by preventing the creation of `__dict__` for every instance.",
        codeExamples: [
          {
            language: 'python',
            code: `class Point:\n    __slots__ = ['x', 'y']\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y`,
            description: "Memory optimization."
          }
        ]
      }
    ],
    lab: {
      instruction: "Create a class `Dictionary` that acts like a dict but allows attribute access (d.key) via `__getattr__` and `__setattr__`.",
      initialCode: `class Dictionary(dict):\n    # implement __getattr__ and __setattr__\n    pass`,
      hint: "__getattr__ is called only when attribute lookup fails.",
      solution: `class Dictionary(dict):\n    def __getattr__(self, key):\n        return self.get(key)\n    def __setattr__(self, key, value):\n        self[key] = value\n\nd = Dictionary()\nd.name = "Test"\nprint(d['name'], d.name)`
    },
    miniProject: {
      instruction: "Implement an N-dimensional `Vector` class supporting addition, subtraction, equality, and a string representation.",
      initialCode: `class Vector:\n    def __init__(self, *components):\n        self.components = components\n    # Implement dunders\n    pass`,
      hint: "Use `zip()` for element-wise operations. Raise ValueError if dimensions don't match.",
      solution: `class Vector:\n    def __init__(self, *components):\n        self.components = components\n    def __add__(self, other):\n        if len(self.components) != len(other.components): raise ValueError("Dim mismatch")\n        return Vector(*[x+y for x, y in zip(self.components, other.components)])\n    def __sub__(self, other):\n        if len(self.components) != len(other.components): raise ValueError("Dim mismatch")\n        return Vector(*[x-y for x, y in zip(self.components, other.components)])\n    def __eq__(self, other):\n        return self.components == other.components\n    def __repr__(self):\n        return f"Vector{self.components}"\n\nv = Vector(1, 2) + Vector(3, 4)\nprint(v)`
    }
  },
  {
    id: 5,
    title: "Concurrency: Asyncio & The GIL",
    description: "Handling I/O bound tasks efficiently with modern Async/Await patterns and understanding the GIL.",
    topics: [
      {
        title: "Coroutines & Event Loop",
        content: "Use `async def` and `await`. `asyncio.gather` runs tasks concurrently on a single thread.",
        codeExamples: [
          {
            language: 'python',
            code: `import asyncio\n\nasync def say(delay, msg):\n    await asyncio.sleep(delay)\n    print(msg)\n\nasync def main():\n    await asyncio.gather(\n        say(1, "World"),\n        say(0.5, "Hello")\n    )\n\n# await main() # In standard python`,
            description: "Basic Asyncio (Simulated)."
          }
        ]
      },
      {
        title: "The Global Interpreter Lock (GIL)",
        content: "The GIL is a mutex that protects access to Python objects, preventing multiple threads from executing Python bytecodes at once. This simplifies CPython's memory management but prevents multi-core parallelism for CPU-bound tasks. To bypass the GIL, use `multiprocessing` instead of `threading`.",
        codeExamples: [
            {
                language: 'python',
                code: `import time\n# Simulated multiprocessing structure\n# NOTE: Full multiprocessing support in Pyodide/WASM is limited.\n\ndef cpu_bound_task(n):\n    while n > 0:\n        n -= 1\n\nstart = time.time()\n# In a real environment:\n# with Pool(processes=2) as pool:\n#     pool.map(cpu_bound_task, [10000000]*2)\ncpu_bound_task(1000000)\nprint(f"Task finished in {time.time() - start:.4f}s")`,
                description: "Concept: CPU Bound tasks block threads."
            }
        ],
        pitfalls: [
            "Do not use `threading` for CPU-intensive work (e.g., number crunching, image processing); it may be slower than sequential execution due to context switching overhead.",
            "Use `threading` or `asyncio` for I/O-bound work (e.g., web requests, file I/O).",
            "Use `multiprocessing` for CPU-bound work to utilize multiple cores."
        ]
      }
    ],
    lab: {
      instruction: "Simulate fetching data from 3 URLs concurrently with different delays. Print when all are done.",
      initialCode: `import asyncio\nasync def fetch(id, delay):\n    # simulate wait\n    return f"Data {id}"\n\nasync def main():\n    # use gather\n    pass\n\nawait main()`,
      hint: "asyncio.gather returns a list of results in order.",
      solution: `import asyncio\nasync def fetch(id, delay):\n    print(f"Start {id}")\n    await asyncio.sleep(delay)\n    print(f"Done {id}")\n    return id\n\nasync def main():\n    results = await asyncio.gather(fetch(1, 0.5), fetch(2, 0.1), fetch(3, 0.3))\n    print("All results:", results)\n\nawait main()`
    },
    miniProject: {
      instruction: "Implement a Producer-Consumer pattern using `asyncio.Queue`.",
      initialCode: `import asyncio\nq = asyncio.Queue()\nasync def producer(): pass\nasync def consumer(): pass\n# run until queue empty`,
      hint: "Producer does q.put(), consumer does q.get() and q.task_done().",
      solution: `import asyncio\n\nasync def producer(q):\n    for i in range(5):\n        await q.put(i)\n        print(f"Produced {i}")\n\nasync def consumer(q):\n    while not q.empty():\n        item = await q.get()\n        print(f"Consumed {item}")\n        q.task_done()\n\nq = asyncio.Queue()\nawait producer(q)\nawait consumer(q)`
    }
  },
  {
    id: 6,
    title: "Type Hinting & Modern Python",
    description: "Writing robust code with the `typing` module, Generics, and Dataclasses.",
    topics: [
      {
        title: "Dataclasses",
        content: "Automates `__init__`, `__repr__`, etc. Use `frozen=True` for immutability.",
        codeExamples: [
          {
            language: 'python',
            code: `from dataclasses import dataclass\n\n@dataclass(frozen=True)\nclass User:\n    id: int\n    username: str\n\nu = User(1, "Admin")\nprint(u)`,
            description: "Immutable Data Object."
          }
        ]
      },
      {
        title: "Type Aliases & Union",
        content: "Use `List`, `Dict`, `Optional`, `Union` from `typing` (or built-ins in Python 3.10+).",
        codeExamples: [
          {
            language: 'python',
            code: `from typing import List, Union\n\nNumber = Union[int, float]\n\ndef scale(data: List[Number], factor: Number) -> List[Number]:\n    return [d * factor for d in data]`,
            description: "Type Hints."
          }
        ]
      }
    ],
    lab: {
      instruction: "Define a Generic class `Box[T]` that holds a value of type T. Add methods to set/get.",
      initialCode: `from typing import TypeVar, Generic\nT = TypeVar('T')\nclass Box(Generic[T]):\n    # implement\n    pass`,
      hint: "Inherit from Generic[T].",
      solution: `from typing import TypeVar, Generic\nT = TypeVar('T')\n\nclass Box(Generic[T]):\n    def __init__(self, item: T):\n        self.item = item\n    def get(self) -> T:\n        return self.item\n\nb = Box(123)\nprint(b.get())`
    },
    miniProject: {
      instruction: "Create a schema validation simulation using Dataclasses. Create a `post_init` hook to validate data.",
      initialCode: `from dataclasses import dataclass\n@dataclass\nclass Product:\n    price: float\n    # validate price > 0`,
      hint: "Use __post_init__(self).",
      solution: `from dataclasses import dataclass\n\n@dataclass\nclass Product:\n    name: str\n    price: float\n\n    def __post_init__(self):\n        if self.price < 0:\n            raise ValueError("Price cannot be negative")\n\ntry:\n    p = Product("Bad", -10)\nexcept ValueError as e:\n    print(e)`
    }
  },
  {
    id: 7,
    title: "Design Patterns (GoF)",
    description: "Implementing standard software design patterns in Pythonic ways.",
    topics: [
      {
        title: "Singleton",
        content: "Ensuring a class has only one instance. Pythonic way: Use a module or a Decorator.",
        codeExamples: [
          {
            language: 'python',
            code: `def singleton(cls):\n    instances = {}\n    def get_instance(*args, **kwargs):\n        if cls not in instances:\n            instances[cls] = cls(*args, **kwargs)\n        return instances[cls]\n    return get_instance\n\n@singleton\nclass DB:\n    pass`,
            description: "Singleton Decorator."
          }
        ]
      },
      {
        title: "Strategy Pattern",
        content: "Defining a family of algorithms. In Python, often implemented simply by passing functions.",
        codeExamples: [
          {
            language: 'python',
            code: `def pay_cc(amt): print(f"Paid {amt} via CC")\ndef pay_pp(amt): print(f"Paid {amt} via PayPal")\n\ndef process(amt, strategy):\n    strategy(amt)\n\nprocess(100, pay_cc)`,
            description: "Functional Strategy."
          }
        ]
      }
    ],
    lab: {
      instruction: "Implement the Observer pattern where a Subject notifies multiple Observers of state changes.",
      initialCode: `class Subject:\n    # attach, detach, notify\nclass Observer:\n    # update`,
      hint: "Subject keeps a list of observers.",
      solution: `class Subject:\n    def __init__(self): self._obs = []\n    def attach(self, obs): self._obs.append(obs)\n    def notify(self, msg):\n        for o in self._obs: o.update(msg)\n\nclass Observer:\n    def update(self, msg): print(f"Got: {msg}")\n\ns = Subject()\ns.attach(Observer())\ns.notify("Update Available")`
    },
    miniProject: {
      instruction: "Factory Pattern: Create a `SerializerFactory` that returns a serializer class (JSON or XML) based on input format string.",
      initialCode: `class JSONSerializer: ...\nclass XMLSerializer: ...\ndef get_serializer(fmt): ...`,
      hint: "Return the class or instance.",
      solution: `class JSON:\n    def serialize(self): return "{json}"\nclass XML:\n    def serialize(self): return "<xml>"\n\ndef factory(fmt):\n    serializers = {"json": JSON, "xml": XML}\n    return serializers.get(fmt)()\n\nprint(factory("json").serialize())`
    }
  },
  {
    id: 8,
    title: "Advanced Metaprogramming",
    description: "Code that manipulates code. Runtime attribute creation and class construction.",
    topics: [
      {
        title: "type() and Metaclasses",
        content: "Classes are instances of Metaclasses. `type` is the default metaclass.",
        codeExamples: [
          {
            language: 'python',
            code: `MyClass = type('MyClass', (object,), {'x': 5})\no = MyClass()\nprint(o.x)`,
            description: "Dynamic Class Creation."
          }
        ]
      }
    ],
    lab: {
      instruction: "Create a Metaclass `MetaRegistry` that automatically adds every subclass to a global registry dict.",
      initialCode: `registry = {}\nclass MetaRegistry(type):\n    # __new__\n\nclass Base(metaclass=MetaRegistry):\n    pass`,
      hint: "Intercept __new__ or __init__ in the metaclass.",
      solution: `registry = {}\nclass MetaRegistry(type):\n    def __new__(cls, name, bases, attrs):\n        new_cls = super().__new__(cls, name, bases, attrs)\n        registry[name] = new_cls\n        return new_cls\n\nclass A(metaclass=MetaRegistry): pass\nclass B(metaclass=MetaRegistry): pass\nprint(registry.keys())`
    },
    miniProject: {
      instruction: "Write a descriptor `Validation` that enforces type checking on class attributes.",
      initialCode: `class Typed:\n    def __init__(self, name, expected_type):\n        # ...\n    def __set__(self, instance, value):\n        # check type`,
      hint: "Descriptors implement __get__ and __set__.",
      solution: `class Typed:\n    def __init__(self, name, type_):\n        self.name = name\n        self.type_ = type_\n    def __set__(self, instance, value):\n        if not isinstance(value, self.type_):\n            raise TypeError(f"Expected {self.type_}")\n        instance.__dict__[self.name] = value\n\nclass Person:\n    name = Typed("name", str)\n    age = Typed("age", int)\n\np = Person()\np.age = 30\n# p.age = "Old" # raises Error\nprint(p.age)`
    }
  }
];

// --- COMPREHENSIVE CONCEPTS DATA (REFERENCE: 100+ CONCEPTS) ---
export const CONCEPTS_DATA: ConceptTopic[] = [
  // --- LEVEL 1: BASIC ---
  {
    id: 'basic-types',
    title: 'Variables, Numbers & Math',
    level: 'Basic',
    description: "Foundational concepts of memory labels, integers, floating point arithmetic, and type coercion.",
    sections: [
      { title: "Dynamic Typing", content: "Variables are references to objects, not fixed containers.", code: `x = 100\nprint(type(x))\nx = "Python"\nprint(type(x))` },
      { title: "Integers & Precision", content: "Python integers have arbitrary precision.", code: `print(2**100)` },
      { title: "Floating Point", content: "Standard IEEE 754 double precision.", code: `print(0.1 + 0.2)` },
      { title: "Arithmetic Operators", content: "+, -, *, /, // (floor), % (mod), ** (pow).", code: `print(7 // 2, 7 % 2, 2**3)` },
      { title: "Augmented Assignment", content: "+=, -=, *=, etc.", code: `x = 1; x += 1; print(x)` },
    ]
  },
  {
    id: 'basic-strings',
    title: 'Strings & Text Processing',
    level: 'Basic',
    description: "Handling text data, f-strings, and string methods.",
    sections: [
      { title: "String Creation", content: "Single, double, or triple quotes.", code: `s = 'Hi'; m = """Line 1\nLine 2"""\nprint(m)` },
      { title: "F-Strings", content: "Interpolation (Python 3.6+).", code: `name="Ali"; age=20\nprint(f"{name} is {age}")` },
      { title: "Slicing", content: "Extracting substrings [start:end:step].", code: `s = "Python"\nprint(s[::-1]) # Reverse` },
      { title: "String Methods", content: "upper(), lower(), strip(), split(), replace().", code: `print(" a,b ".strip().split(","))` },
      { title: "Immutability", content: "Strings cannot be changed in place.", code: `s = "a"\n# s[0] = "b" # Error\ns = "b" # Rebinding OK` },
    ]
  },
  {
    id: 'basic-lists',
    title: 'Lists (Mutable Sequences)',
    level: 'Basic',
    description: "Ordered, mutable collections of arbitrary objects.",
    sections: [
      { title: "List Creation", content: "Square brackets or list().", code: `l = [1, "two", 3.0]` },
      { title: "Indexing & Slicing", content: "Access by position.", code: `l = [10, 20, 30]\nprint(l[-1])` },
      { title: "Adding Elements", content: "append(), insert(), extend().", code: `l = [1]; l.append(2); l.extend([3,4]); print(l)` },
      { title: "Removing Elements", content: "pop(), remove(), del.", code: `l = [1,2,3]; l.pop(); print(l)` },
      { title: "Sorting", content: "sort() (in-place) vs sorted() (new list).", code: `l=[3,1,2]; l.sort(); print(l)` },
    ]
  },
  {
    id: 'basic-tuples',
    title: 'Tuples (Immutable Sequences)',
    level: 'Basic',
    description: "Fixed ordered collections. Faster and hashable if contents are immutable.",
    sections: [
      { title: "Tuple Creation", content: "Parentheses or comma separated.", code: `t = 1, 2, 3\nprint(type(t))` },
      { title: "Immutability", content: "Protecting data integrity.", code: `t = (1, 2)\n# t[0] = 3 # Error` },
      { title: "Unpacking", content: "Destructuring into variables.", code: `x, y = (10, 20)\nprint(x, y)` },
      { title: "Single Item Tuple", content: "Requires a trailing comma.", code: `t = (1,) # Not (1)` },
      { title: "Tuple vs List", content: "Tuples for heterogeneous data (records), Lists for homogeneous.", code: `record = ("John", 25, "Engineer")` },
    ]
  },
  {
    id: 'basic-dicts',
    title: 'Dictionaries (Hash Maps)',
    level: 'Basic',
    description: "Key-Value pairs. Keys must be hashable.",
    sections: [
      { title: "Dict Creation", content: "Curly braces or dict().", code: `d = {"a": 1, "b": 2}` },
      { title: "Accessing Values", content: "By key or .get() (safe).", code: `print(d["a"], d.get("c", 0))` },
      { title: "Modifying", content: "Assignment adds or updates.", code: `d["c"] = 3` },
      { title: "Iteration", content: ".keys(), .values(), .items().", code: `for k,v in d.items(): print(k,v)` },
      { title: "Key Constraints", content: "Keys must be immutable (str, int, tuple).", code: `d = {(1,2): "ok"}` },
    ]
  },
  {
    id: 'basic-sets',
    title: 'Sets (Unique Collections)',
    level: 'Basic',
    description: "Unordered collections of unique elements. Mathematical set operations.",
    sections: [
      { title: "Set Creation", content: "Curly braces (non-empty) or set().", code: `s = {1, 2, 2, 3}\nprint(s)` },
      { title: "Membership", content: "Fast 'in' checks (O(1)).", code: `print(1 in {1, 2, 3})` },
      { title: "Union (|)", content: "Elements in either set.", code: `print({1,2} | {2,3})` },
      { title: "Intersection (&)", content: "Elements in both sets.", code: `print({1,2} & {2,3})` },
      { title: "Difference (-)", content: "Elements in A but not B.", code: `print({1,2} - {2,3})` },
    ]
  },
  {
    id: 'basic-control',
    title: 'Control Flow',
    level: 'Basic',
    description: "Directing program execution.",
    sections: [
      { title: "If / Elif / Else", content: "Conditional logic.", code: `x=5\nif x>10: print("A")\nelif x>0: print("B")\nelse: print("C")` },
      { title: "Ternary Operator", content: "Inline if-else.", code: `status = "Adult" if age >= 18 else "Minor"` },
      { title: "While Loops", content: "Indefinite iteration.", code: `n=3\nwhile n>0: print(n); n-=1` },
      { title: "For Loops", content: "Iterate over iterable.", code: `for i in range(3): print(i)` },
      { title: "Break & Continue", content: "Loop control.", code: `for i in range(5):\n if i==2: continue\n if i==4: break\n print(i)` },
    ]
  },
  {
    id: 'basic-functions',
    title: 'Functions I',
    level: 'Basic',
    description: "Defining reusable blocks of code.",
    sections: [
      { title: "def Keyword", content: "Defining a function.", code: `def f(): return 1` },
      { title: "Parameters", content: "Passing data.", code: `def add(a, b): return a+b` },
      { title: "Default Args", content: "Optional parameters.", code: `def pow(a, b=2): return a**b` },
      { title: "Keyword Arguments", content: "Naming arguments at call site.", code: `print(div(numerator=10, denominator=2))` },
      { title: "Return", content: "Returning values (None default).", code: `def f(): return\nprint(f())` },
    ]
  },

  // --- LEVEL 2: INTERMEDIATE ---
  {
    id: 'inter-scope',
    title: 'Scope & Namespaces',
    level: 'Intermediate',
    description: "LEGB Rule: Local, Enclosing, Global, Built-in.",
    sections: [
      { title: "Local Scope", content: "Variables inside functions.", code: `def f(): x=1 # Local` },
      { title: "Global Scope", content: "Module level variables.", code: `x=10\ndef f(): print(x)` },
      { title: "Global Keyword", content: "Modifying global inside function.", code: `g=0\ndef inc(): global g; g+=1` },
      { title: "Nonlocal Keyword", content: "Modifying enclosing scope.", code: `def out():\n x=0\n def inn(): nonlocal x; x=1\n inn(); print(x)` },
      { title: "Built-ins", content: "Standard functions (len, print).", code: `print(len("test"))` },
    ]
  },
  {
    id: 'inter-args',
    title: '*args & **kwargs',
    level: 'Intermediate',
    description: "Flexible function arguments.",
    sections: [
      { title: "*args", content: "Tuple of positional args.", code: `def f(*args): print(args)\nf(1,2)` },
      { title: "**kwargs", content: "Dictionary of keyword args.", code: `def f(**kwargs): print(kwargs)\nf(a=1)` },
      { title: "Ordering", content: "Standard, *args, Defaults, **kwargs.", code: `def f(a, *b, c=1, **d): pass` },
      { title: "Unpacking in Call", content: "Passing list/dict as args.", code: `l=[1,2]; f(*l)` },
      { title: "Forcing Keywords", content: "Using * separator.", code: `def f(*, a): pass # a must be keyword` },
    ]
  },
  {
    id: 'inter-comprehensions',
    title: 'Comprehensions',
    level: 'Intermediate',
    description: "Concise syntax for creating collections.",
    sections: [
      { title: "List Comp", content: "[expr for item in iterable].", code: `[x**2 for x in range(5)]` },
      { title: "Filtering", content: "With if clause.", code: `[x for x in range(10) if x%2==0]` },
      { title: "Dict Comp", content: "{k:v for ...}", code: `{x: x*10 for x in range(3)}` },
      { title: "Set Comp", content: "{x for ...}", code: `{x%3 for x in range(10)}` },
      { title: "Nested Loops", content: "Flattening.", code: `[y for x in [[1,2],[3]] for y in x]` },
    ]
  },
  {
    id: 'inter-exceptions',
    title: 'Exception Handling',
    level: 'Intermediate',
    description: "Managing runtime errors gracefully.",
    sections: [
      { title: "Try / Except", content: "Catching errors.", code: `try: 1/0\nexcept: print("Err")` },
      { title: "Specific Exceptions", content: "Catch specific types.", code: `except (ValueError, TypeError) as e:` },
      { title: "Else Block", content: "Runs if no exception.", code: `try: x=1\nexcept: pass\nelse: print("OK")` },
      { title: "Finally Block", content: "Always runs.", code: `finally: print("Cleanup")` },
      { title: "Raise", content: "Triggering errors.", code: `raise ValueError("Invalid")` },
    ]
  },
  {
    id: 'inter-files',
    title: 'File I/O',
    level: 'Intermediate',
    description: "Reading and writing files.",
    sections: [
      { title: "Opening Files", content: "open(file, mode).", code: `f = open("t.txt", "w")` },
      { title: "Context Manager", content: "With statement auto-closes.", code: `with open("t.txt") as f: print(f.read())` },
      { title: "Reading", content: "read(), readline(), readlines().", code: `f.read()` },
      { title: "Writing", content: "write(), writelines().", code: `f.write("Hello")` },
      { title: "File Modes", content: "r, w, a (append), b (binary).", code: `open("img.png", "rb")` },
    ]
  },
  {
    id: 'inter-oop',
    title: 'Classes & Objects',
    level: 'Intermediate',
    description: "Object Oriented Programming basics.",
    sections: [
      { title: "Class Definition", content: "class Name:", code: `class User: pass` },
      { title: "__init__", content: "Constructor.", code: `def __init__(self, name): self.name=name` },
      { title: "Methods", content: "Functions in class.", code: `def greet(self): return self.name` },
      { title: "Class Variables", content: "Shared by all instances.", code: `class A: count=0` },
      { title: "Inheritance", content: "Subclassing.", code: `class Admin(User): pass` },
    ]
  },
  {
    id: 'inter-modules',
    title: 'Modules & Imports',
    level: 'Intermediate',
    description: "Organizing code into files.",
    sections: [
      { title: "Import", content: "import math", code: `import math; print(math.pi)` },
      { title: "From ... Import", content: "Specific items.", code: `from math import sqrt` },
      { title: "Aliasing", content: "as keyword.", code: `import pandas as pd` },
      { title: "__name__", content: "Script vs Module check.", code: `if __name__ == "__main__": main()` },
      { title: "dir()", content: "Inspect module contents.", code: `print(dir(math))` },
    ]
  },
  {
    id: 'inter-lambdas',
    title: 'Lambdas & Functional',
    level: 'Intermediate',
    description: "Anonymous functions and functional tools.",
    sections: [
      { title: "Lambda Syntax", content: "lambda args: expr", code: `add = lambda x,y: x+y` },
      { title: "Sorting Key", content: "Common use case.", code: `data.sort(key=lambda x: x['age'])` },
      { title: "Map", content: "Apply to all.", code: `map(lambda x: x*2, [1,2])` },
      { title: "Filter", content: "Select items.", code: `filter(lambda x: x>0, [-1, 1])` },
      { title: "Any / All", content: "Boolean aggregation.", code: `any([True, False]) # True` },
    ]
  },

  // --- LEVEL 3: ADVANCED ---
  {
    id: 'adv-dunders',
    title: 'Dunder (Magic) Methods',
    level: 'Advanced',
    description: "Customizing object behavior with double underscores.",
    sections: [
      { title: "String Repr", content: "__str__ vs __repr__.", code: `def __str__(self): return "User"` },
      { title: "Arithmetic", content: "__add__, __sub__.", code: `def __add__(self, o): return self.v + o.v` },
      { title: "Length", content: "__len__.", code: `def __len__(self): return 10` },
      { title: "Item Access", content: "__getitem__, __setitem__.", code: `def __getitem__(self, k): return self.data[k]` },
      { title: "Call", content: "__call__ (make object callable).", code: `obj()` },
    ]
  },
  {
    id: 'adv-iterators',
    title: 'Iterators & Generators',
    level: 'Advanced',
    description: "Creating custom iteration patterns.",
    sections: [
      { title: "Iterator Protocol", content: "__iter__ and __next__.", code: `def __next__(self): return 1` },
      { title: "Yield", content: "Lazy generation.", code: `def gen(): yield 1` },
      { title: "Generator Expressions", content: "(x for x in y).", code: `g = (x**2 for x in range(10))` },
      { title: "Yield From", content: "Delegating generators.", code: `yield from sub_gen()` },
      { title: "StopIteration", content: "Signaling end.", code: `raise StopIteration` },
    ]
  },
  {
    id: 'adv-decorators',
    title: 'Decorators',
    level: 'Advanced',
    description: "Metaprogramming functions.",
    sections: [
      { title: "Basic Decorator", content: "Wrap function.", code: `def d(f): return lambda: f()` },
      { title: "@Syntax", content: "Apply decorator.", code: `self.wrapped = d(self.orig)` },
      { title: "functools.wraps", content: "Preserve metadata.", code: `from functools import wraps` },
      { title: "Arguments", content: "Decorator factories.", code: `def repeat(n): ...` },
      { title: "Class Decorators", content: "Modify classes.", code: `def singleton(cls): ...` },
    ]
  },
  {
    id: 'adv-context',
    title: 'Context Managers',
    level: 'Advanced',
    description: "Resource management protocols.",
    sections: [
      { title: "Protocol", content: "__enter__ and __exit__.", code: `def __enter__(self): return self` },
      { title: "Exception Handling", content: "__exit__ return True suppresses error.", code: `return True # Swallows error` },
      { title: "contextlib", content: "@contextmanager decorator.", code: `from contextlib import contextmanager` },
      { title: "Multiple Contexts", content: "with A(), B():", code: `with open(a) as f1, open(b) as f2:` },
      { title: "Closing", content: "contextlib.closing helper.", code: `from contextlib import closing` },
    ]
  },
  {
    id: 'adv-threading',
    title: 'Threading vs Multiprocessing',
    level: 'Advanced',
    description: "Concurrency models.",
    sections: [
      { title: "Threading", content: "Shared memory, GIL limited.", code: `threading.Thread(target=f)` },
      { title: "Multiprocessing", content: "Separate memory, CPU parallelism.", code: `multiprocessing.Process(target=f)` },
      { title: "Daemon Threads", content: "Background tasks.", code: `t.daemon = True` },
      { title: "Locks", content: "Synchronization.", code: `lock.acquire(); lock.release()` },
      { title: "Queue", content: "Thread-safe communication.", code: `q.put(1)` },
    ]
  },
  {
    id: 'adv-asyncio',
    title: 'AsyncIO',
    level: 'Advanced',
    description: "Single-threaded concurrent I/O.",
    sections: [
      { title: "Async/Await", content: "Keywords.", code: `async def f(): await wait()` },
      { title: "Event Loop", content: "Running tasks.", code: `asyncio.run(main())` },
      { title: "Gather", content: "Concurrent execution.", code: `await asyncio.gather(t1(), t2())` },
      { title: "Tasks", content: "Background execution.", code: `asyncio.create_task(bg())` },
      { title: "Sleep", content: "Non-blocking delay.", code: `await asyncio.sleep(1)` },
    ]
  },
  {
    id: 'adv-internals',
    title: 'Python Internals',
    level: 'Advanced',
    description: "How Python works under the hood.",
    sections: [
      { title: "Bytecode", content: "Compiled python.", code: `import dis; dis.dis(f)` },
      { title: "Reference Counting", content: "Primary GC mechanism.", code: `sys.getrefcount(obj)` },
      { title: "Garbage Collection", content: "Cyclic GC.", code: `import gc; gc.collect()` },
      { title: "GIL", content: "Global Interpreter Lock details.", code: `# Mutex on CPython interpreter` },
      { title: "Interning", content: "Small int/string caching.", code: `a=1; b=1; a is b` },
    ]
  },
  {
    id: 'adv-metaclasses',
    title: 'Metaclasses',
    level: 'Advanced',
    description: "Classes of classes.",
    sections: [
      { title: "type()", content: "The default metaclass.", code: `type(name, bases, dict)` },
      { title: "Custom Metaclass", content: "Inherit from type.", code: `class Meta(type): pass` },
      { title: "__new__", content: "Allocating the class.", code: `def __new__(mcs, name, bases, dct):` },
      { title: "Registration", content: "Auto-register plugins.", code: `registry[name] = cls` },
      { title: "Singleton Meta", content: "Enforcing single instance.", code: `_instances = {}` },
    ]
  }
];

// --- PRACTICE ARENA GENERATOR ---
// (Examples remain same as previous to maintain functionality)
export const PRACTICE_CATEGORIES: PracticeCategory[] = [
  { id: 'functional', title: 'Functional & Lambdas', description: 'Map, Filter, Reduce, Partials' },
  { id: 'collections', title: 'Adv. Collections', description: 'Counter, Deque, NamedTuple, Heapq' },
  { id: 'decorators', title: 'Decorators & Wrappers', description: 'Closures, caching, logging' },
  { id: 'generators', title: 'Generators', description: 'Yield, Itertools, Pipelines' },
  { id: 'oop', title: 'Advanced OOP', description: 'Inheritance MRO, Dunders, Abstract Classes' },
  { id: 'async', title: 'Concurrency', description: 'Async/Await, Futures' },
  { id: 'text', title: 'Text & Regex', description: 'Regular Expressions, Formatting' },
  { id: 'math', title: 'Numpy-Style Logic', description: 'Vector math using pure Python' },
  { id: 'dsa', title: 'Interview Patterns (DSA)', description: 'Sliding Window, Two Pointers, DP, Graphs' },
  { id: 'sysdesign', title: 'System Design', description: 'Caching, Hashing, Rate Limiting' },
  { id: 'internals', title: 'Python Internals', description: 'GC, Bytecode, Weakrefs, Slots' },
  { id: 'testing', title: 'Testing & Quality', description: 'Unittest, Mocking, Logging' },
];

const generateExamples = (): PracticeExample[] => {
  const examples: PracticeExample[] = [];
  let idCounter = 1;

  const add = (cat: string, title: string, diff: 'Beginner'|'Intermediate'|'Advanced', code: string, desc: string) => {
    examples.push({
      id: `ex-${idCounter++}`,
      categoryId: cat,
      title,
      difficulty: diff,
      code: code.trim(),
      description: desc
    });
  };

  // --- 1. FUNCTIONAL PATTERNS (50+) ---
  add('functional', 'Simple Lambda', 'Beginner', `sq = lambda x: x**2\nprint(sq(5))`, 'Anonymous function.');
  for(let i=1; i<=25; i++) {
     add('functional', `Map Transformation ${i}`, 'Intermediate', 
     `nums = range(${i+5})\nresult = list(map(lambda x: x*2 + ${i}, nums))\nprint(result)`, 
     'Using map() with lambdas.');
  }
  for(let i=1; i<=25; i++) {
     add('functional', `Filter Logic ${i}`, 'Intermediate', 
     `nums = range(${i*10})\n# Filter numbers divisible by ${i+1}\nprint(list(filter(lambda x: x % ${i+1} == 0, nums)))`, 
     'Using filter() with lambdas.');
  }
  add('functional', 'Reduce Sum', 'Advanced', `from functools import reduce\nnums = [1,2,3,4]\nprint(reduce(lambda a,b: a+b, nums))`, 'Cumulative computation.');
  
  // --- 2. COLLECTIONS & DATA (100+) ---
  add('collections', 'Counter Basic', 'Beginner', `from collections import Counter\nc = Counter("abracadabra")\nprint(c.most_common(2))`, 'Counting elements.');
  for(let i=1; i<=50; i++) {
    add('collections', `List Comp Conditional ${i}`, 'Intermediate', 
    `# Evens squared if > ${i}\nres = [x**2 for x in range(20) if x > ${i} and x % 2 == 0]\nprint(res)`, 
    'Complex list comprehensions.');
  }
  for(let i=1; i<=50; i++) {
    add('collections', `Dict Comp Inversion ${i}`, 'Intermediate', 
    `orig = {x: x**2 for x in range(${i}, ${i+5})}\ninv = {v: k for k, v in orig.items()}\nprint(inv)`, 
    'Inverting dictionary keys/values.');
  }

  // --- 3. DECORATORS (50+) ---
  add('decorators', 'Timing Decorator', 'Advanced', `import time\ndef timer(f):\n    def w(*a,**k):\n        s=time.time()\n        r=f(*a,**k)\n        print(time.time()-s)\n        return r\n    return w\n\n@timer\ndef run(): sum(range(10000))\nrun()`, 'Performance timing.');
  
  // Generate Decorator variations
  for(let i=1; i<=50; i++) {
    const perm = i % 3;
    if(perm===0) add('decorators', `Logger Variation ${i}`, 'Intermediate', `def log(f):\n    def w():\n        print("Run ${i}")\n        f()\n    return w\n@log\ndef act(): pass\nact()`, 'Basic logging wrapper.');
    if(perm===1) add('decorators', `Tagging Decorator ${i}`, 'Advanced', `def tag(f):\n    f.tag = "v${i}"\n    return f\n@tag\ndef api(): pass\nprint(api.tag)`, 'Adding attributes to functions.');
    if(perm===2) add('decorators', `Retry Simulator ${i}`, 'Advanced', `def retry(f):\n    def w():\n        for _ in range(${i%5 + 1}):\n            try: return f()\n            except: pass\n    return w`, 'Exception handling wrapper.');
  }

  // --- 4. OOP & DUNDERS (150+) ---
  for(let i=1; i<=75; i++) {
    add('oop', `Custom String Repr ${i}`, 'Beginner', 
    `class Item:\n    def __init__(self, v):\n        self.v = v * ${i}\n    def __repr__(self):\n        return f"Item-{self.v}"\nprint(Item(10))`, 
    '__repr__ customization.');
  }
  for(let i=1; i<=75; i++) {
    add('oop', `Operator Overload ${i}`, 'Advanced', 
    `class Num:\n    def __init__(self, v): self.v = v\n    def __add__(self, o): return self.v + o.v + ${i}\nprint(Num(10) + Num(20))`, 
    'Overloading math operators.');
  }

  // --- 5. GENERATORS (50+) ---
  for(let i=1; i<=50; i++) {
    add('generators', `Infinite Stream ${i}`, 'Advanced', 
    `def stream():\n    n = ${i}\n    while True:\n        yield n\n        n += 1\ng = stream()\nprint(next(g), next(g))`, 
    'Infinite generator logic.');
  }

  // --- 6. REGEX (50+) ---
  for(let i=1; i<=50; i++) {
     add('text', `Regex Pattern ${i}`, 'Intermediate', `import re\ntxt="User${i}: 555-0199"\nprint(re.findall(r"\\d+", txt))`, 'Finding digits.');
  }

  // --- 7. ASYNC (50+) ---
  for(let i=1; i<=50; i++) {
      add('async', `Async Sleep ${i}`, 'Advanced', `import asyncio\nasync def task():\n    print("Start")\n    await asyncio.sleep(${i/10.0})\n    print("End")\nawait task()`, 'Async/Await basics.');
  }

  // --- 8. MATH (Generic filler for volume) ---
  for(let i=1; i<=50; i++) {
      add('math', `Vector Calc ${i}`, 'Beginner', `v = [x * ${i} for x in range(10)]\nprint(sum(v))`, 'List math.');
  }

  // --- 9. DSA PATTERNS (200+) ---
  // Sliding Window
  for(let i=1; i<=30; i++) {
      add('dsa', `Sliding Window Max Sum ${i}`, 'Intermediate',
      `def max_sum(arr, k):\n    if len(arr) < k: return -1\n    window = sum(arr[:k])\n    mx = window\n    for i in range(len(arr)-k):\n        window = window - arr[i] + arr[i+k]\n        mx = max(mx, window)\n    return mx\nprint(max_sum([1, 4, 2, 10, 23, 3, 1, 0, 20], ${i%4 + 2}))`,
      'Find max sum of subarray of size K.');
  }

  // Two Pointers
  for(let i=1; i<=30; i++) {
      add('dsa', `Two Pointers Pair Sum ${i}`, 'Intermediate',
      `def has_pair(arr, target):\n    l, r = 0, len(arr)-1\n    while l < r:\n        s = arr[l] + arr[r]\n        if s == target: return (arr[l], arr[r])\n        elif s < target: l += 1\n        else: r -= 1\n    return None\narr = sorted([1, ${i}, 5, 7, 9, 12])\nprint(has_pair(arr, 12))`,
      'Find pair with target sum in sorted array.');
  }
  
  // DFS / Recursion
  for(let i=1; i<=40; i++) {
      add('dsa', `Grid DFS Traversal ${i}`, 'Advanced',
      `grid = [[1,1,0],[1,0,0],[0,0,1]]\nvisited = set()\ndef dfs(r, c):\n    if (r,c) in visited or not (0<=r<3 and 0<=c<3) or grid[r][c] == 0: return\n    visited.add((r,c))\n    print(f"Visit {r},{c}")\n    dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1)\ndfs(0, 0)`,
      'Depth First Search on Grid.');
  }

  // DP
    for(let i=1; i<=30; i++) {
      add('dsa', `Climbing Stairs DP ${i}`, 'Intermediate',
      `def climb(n):\n    if n <= 2: return n\n    a, b = 1, 2\n    for _ in range(3, n+1):\n        a, b = b, a+b\n    return b\nprint(climb(${i+5}))`,
      'Dynamic Programming optimization.');
  }

  // Binary Search Trees
  for(let i=1; i<=35; i++) {
      add('dsa', `BST Insert ${i}`, 'Intermediate',
      `class Node:\n    def __init__(self, v): self.val=v; self.left=None; self.right=None\ndef insert(root, v):\n    if not root: return Node(v)\n    if v < root.val: root.left = insert(root.left, v)\n    else: root.right = insert(root.right, v)\n    return root\nr = Node(10)\ninsert(r, ${i})\nprint(f"Left: {r.left.val if r.left else 'None'}, Right: {r.right.val if r.right else 'None'}")`,
      'Tree manipulation.');
  }
  // Heaps
  for(let i=1; i<=35; i++) {
      add('dsa', `Heap Sort Step ${i}`, 'Advanced',
      `import heapq\narr = [5, 1, 8, 3, ${i}]\nheapq.heapify(arr)\nprint([heapq.heappop(arr) for _ in range(len(arr))])`,
      'Priority Queue logic.');
  }

  // --- 10. SYSTEM DESIGN (50+) ---
  // Consistent Hashing
  for(let i=1; i<=15; i++) {
     add('sysdesign', `Consistent Hashing Node ${i}`, 'Advanced',
     `import hashlib\nnodes = [f"Node-{k}" for k in range(${i+2})]\nkey = "UserData"\nhash_val = int(hashlib.md5(key.encode()).hexdigest(), 16)\nmapped_node = nodes[hash_val % len(nodes)]\nprint(f"{key} -> {mapped_node}")`,
     'Distributing keys across nodes.');
  }
  // Rate Limiter
  for(let i=1; i<=15; i++) {
     add('sysdesign', `Token Bucket Rate Limiter ${i}`, 'Advanced',
     `import time\nclass TokenBucket:\n    def __init__(self, tokens, fill_rate):\n        self.capacity = tokens\n        self.tokens = tokens\n        self.fill_rate = fill_rate\n        self.last = time.time()\n    def consume(self, tokens):\n        now = time.time()\n        self.tokens = min(self.capacity, self.tokens + (now - self.last) * self.fill_rate)\n        self.last = now\n        if self.tokens >= tokens:\n            self.tokens -= tokens\n            return True\n        return False\nb = TokenBucket(10, 1)\nprint(b.consume(${i%5+1}))`,
     'Rate limiting algorithm.');
  }
  // LRU Cache
  for(let i=1; i<=20; i++) {
      add('sysdesign', `LRU Cache Logic ${i}`, 'Advanced',
      `from collections import OrderedDict\nclass LRU(OrderedDict):\n    def __init__(self, capacity):\n        self.capacity = capacity\n    def get(self, key):\n        if key not in self: return -1\n        self.move_to_end(key)\n        return self[key]\n    def put(self, key, value):\n        if key in self: self.move_to_end(key)\n        self[key] = value\n        if len(self) > self.capacity: self.popitem(last=False)\nl = LRU(${i+2})\nl.put('a', 1)\nl.put('b', 2)\nprint(l.keys())`,
      'Least Recently Used Cache.');
  }

  // --- 11. INTERNALS (100+) ---
  // sys.getsizeof
  for(let i=1; i<=30; i++) {
      add('internals', `Object Size Analysis ${i}`, 'Intermediate',
      `import sys\nx = [1] * ${i*100}\nprint(f"Size of list with ${i*100} ints: {sys.getsizeof(x)} bytes")`,
      'Memory footprint analysis.');
  }
  // Weakref
  for(let i=1; i<=30; i++) {
      add('internals', `Weak Reference ${i}`, 'Advanced',
      `import weakref\nclass A: pass\na = A()\nr = weakref.ref(a)\nprint(f"Ref before del: {r()}")\ndel a\nprint(f"Ref after del: {r()}")`,
      'Garbage collection interaction.');
  }
  // Dis (Bytecode)
  for(let i=1; i<=40; i++) {
       add('internals', `Bytecode Inspection ${i}`, 'Advanced',
       `import dis\ndef func():\n    return ${i} + ${i+1}\ndis.dis(func)`,
       'Inspecting Python bytecode.');
  }

  // --- 12. TESTING (50+) ---
  // Mocking
  for(let i=1; i<=25; i++) {
      add('testing', `Mock Object ${i}`, 'Intermediate',
      `from unittest.mock import MagicMock\nm = MagicMock()\nm.api_call.return_value = {"status": 200, "data": "Item ${i}"}\nprint(m.api_call())`,
      'Simulating dependencies.');
  }
  // Logging
  for(let i=1; i<=25; i++) {
      add('testing', `Log Config ${i}`, 'Beginner',
      `import logging\n# Configure logging\nlogging.basicConfig(level=logging.DEBUG)\nlogger = logging.getLogger('app')\nlogger.info("Info ${i}")\nlogger.warning("Warning ${i}")`,
      'Standard logging patterns.');
  }

  return examples;
};

export const PRACTICE_DATA = generateExamples();
