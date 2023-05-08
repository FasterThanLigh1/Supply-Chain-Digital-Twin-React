import { AgentType } from ".";

class Node {
  constructor(id, data) {
    this.id = id;
    this.data = data;
    this.adjacent = [];
  }
}
class Graph {
  // defining vertex array and
  // adjacent list
  constructor(noOfVertices) {
    this.noOfVertices = noOfVertices;
    this.AdjList = [];
  }
  addVertex(v) {
    // initialize the adjacent list with a
    // null array
    this.AdjList.push(v);
  }
  addEdge(v, w) {
    // get the list for vertex v and put the
    // vertex w denoting edge between v and w
    const temp1 = this.AdjList.find((e) => e.id === v);
    const temp2 = this.AdjList.find((e) => e.id === w);
    temp1.adjacent.push(temp2);
  }
  printGraph() {
    // get all the vertices
    for (let i = 0; i < this.AdjList.length; i++) {
      //console.log("Node: ", this.AdjList[i]);
    }
  }
}

const EventType = {
  Start: "start",
  End: "end",
  Intermediate: "intermediate",
};

const EventStartType = {
  Loop: "loop",
  Message: "message",
  Timer: "timer",
  Auto: "auto",
};

const GatewayType = {
  Parallel: "parallel",
  Exclusive: "exclusive",
};

class BpmnNode {
  constructor(name, next, duration) {
    this.name = name;
    this.next = next;
    this.duration = duration;
    this.trigger = null;
    this.throw = null;
    this.throwEvent = null;
  }
  run() {
    console.log("Super call");
    console.log(this.name);
  }
}
class Event extends BpmnNode {
  constructor(name, next, duration, type, startType, startTime) {
    super(name, next, duration);
    this.type = type;
    this.startType = startType;
    //this.canStart = false;
    this.multiple = false;
    this.startTime = startTime;
  }
}
class Gateway extends BpmnNode {
  constructor(name, next, type) {
    super(name, next, 0);
    this.type = type;
  }
}
class Activity extends BpmnNode {
  constructor(name, next, duration, actionCallback) {
    super(name, next, duration);
    this.actionCallback = actionCallback;
  }
  run() {
    console.log("Base call");
    super.run();
    for (let i = 0; i < this.actionCallback.length; i++) {
      this.actionCallback[i]();
    }
  }
}

const check = (counter, limit) => {
  if (counter === limit) {
    return true;
  } else {
    return false;
  }
};

class Transportation {
  constructor(type, src, des, capacity, cargo) {
    this.type = type;
    this.src = src;
    this.des = des;
    this.curCapacity = 0;
    this.capacity = capacity;
    this.cargo = cargo;
  }
  load(item, quantity) {
    console.log("Load");
    if (this.src.removeInventory(item, quantity)) {
      this.curCapacity += quantity;
      console.log("Capacity before: ", this.curCapacity, this.capacity);
      if (this.curCapacity >= this.capacity) {
        alert("Not enough capacity to load !");
        this.curCapacity -= quantity;
        return;
      }
      this.cargo.push({
        item: item,
        quantity: quantity,
      });

      console.log("Capacity after: ", this.curCapacity, this.capacity);
    }
  }
  unload(item, quantity) {
    console.log("Unload");
    this.curCapacity -= quantity;
    var filteredArray = this.cargo.filter((e) => e.item.name !== item.name);
    this.cargo = filteredArray;
    this.des.addInventory({
      item: item,
      quantity: quantity,
    });
    console.log("Filetered cargo ", this.cargo);
  }
  move() {
    console.log("Move from scr to des");
  }
  print() {
    console.log("This truck: ");
    console.log("type: ", this.type);
    console.log("src: ", this.src);
    console.log("des: ", this.des);
    console.log("curCapacity: ", this.curCapacity);
    console.log("capacity: ", this.capacity);
    console.log("cargo: ", this.cargo);
  }
}

class Agent {
  constructor(name, x, y, inventory, startEvent, type) {
    ////console.log("[CONSTRUCTOR CALLED");
    this.name = name;
    this.location = {
      x: x,
      y: y,
    };
    this.inventory = inventory;
    this.startEvent = startEvent;
    this.processes = [];
    this.type = type;
  }
  addBulk(cargo) {
    for (let i = 0; i < cargo.length; i++) {
      this.addInventory(cargo[i]);
    }
  }
  addInventory(item) {
    console.log("Before:", this.inventory, " and ", item);
    for (let i = 0; i < this.inventory.length; i++) {
      if (this.inventory[i].name === item.item.name) {
        this.inventory[i].quantity += item.quantity;
      }
    }
    console.log("After:", this.inventory);
  }
  removeInventory(item, quantity) {
    console.log("Before:", this.inventory, " and ", item);
    for (let i = 0; i < this.inventory.length; i++) {
      if (this.inventory[i].name === item.name) {
        const temp = this.inventory[i].quantity - quantity;
        if (temp < 0) {
          console.log("Not enough in inventory " + this.name);
          return false;
        } else {
          this.inventory[i].quantity = temp;
        }
      }
    }
    console.log("After:", this.inventory);
    return true;
  }
  run(obj, curTime) {
    //console.log(obj.startEvent);
    console.log("[RUN] " + obj.name + " " + curTime);
    console.log(obj.processes);
    if (obj.processes.length < 1) {
      /* if (
        obj.startEvent.startType === EventStartType.Message &&
        obj.startEvent.canStart == true
      ) {
        console.log("Start event");
        obj.processes.push({
          task: obj.startEvent,
          duration: obj.startEvent.duration,
          curDuration: 1,
        });
      } else  */
      if (obj.startEvent.startType === EventStartType.Timer) {
        if (obj.startEvent.startTime == curTime) {
          console.log("Start timer");
          obj.processes.push({
            task: obj.startEvent,
            duration: obj.startEvent.duration,
            curDuration: 1,
          });
          //console.log(obj.processes);
        }
      }
    } else {
      for (let i = 0; i < obj.processes.length; i++) {
        if (obj.processes[i].task.type === EventType.End) {
          /* if (obj.startEvent.startType === EventStartType.Message) {
            //console.log("[changed can start]");
            obj.startEvent.canStart = false;
          } */
          obj.processes.splice(i, 1);
          i--;
          continue;
        }
        if (obj.processes[i].task.type === GatewayType.Parallel) {
          console.log("In parallel");
          for (let j = 0; j < obj.processes[i].task.next.length; j++) {
            if (
              obj.processes[i].task.next[j].startType !== EventStartType.Message
            ) {
              obj.processes.push({
                task: obj.processes[i].task.next[j],
                duration: obj.processes[i].task.next[j].duration,
                curDuration: 1,
              });
            }
          }
          //console.log("After:", obj.processes);
          obj.processes.splice(0, 1);
          i--;
        } else {
          /* if (
            obj.processes[i].task.startType === EventStartType.Message &&
            obj.processes[i].task.type !== EventType.Start
          ) {
            if (obj.processes[i].task.canStart) {
              obj.processes[i].task.run(() => {
                //console.log("yes ?");
              });
              //console.log("[Task change]");
              obj.processes[i].task = obj.processes[i].task.next;
              obj.processes[i].curDuration = 1;
              obj.processes[i].duration = obj.processes[i].task.duration;
            } else {
              continue;
            }
          } */
          if (obj.processes[i].curDuration >= obj.processes[i].duration) {
            obj.processes[i].task.run(() => {
              //console.log("yes ?");
            });
            //console.log("[Task change]");
            if (obj.processes[i].task.trigger !== null) {
              /* if (obj.processes[i].task.trigger.canStart == false) {
                obj.processes[i].task.trigger.canStart = true;
                //console.log("[Has trigger]", obj.processes[i].task.trigger);
              } else {
                //console.log("[Has multiple]");
              } */
            }
            if (obj.processes[i].task.throw !== null) {
              obj.processes[i].task.throw.processes.push({
                task: obj.processes[i].task.throwEvent,
                duration: obj.processes[i].task.throw.startEvent.duration,
                curDuration: 1,
              });
              console.log(
                "After throw: ",
                obj.processes[i].task.throw.processes
              );
            }
            if (obj.processes[i].task.next.type === GatewayType.Exclusive) {
              if (check(curTime, 6)) {
                obj.processes[i].task = obj.processes[i].task.next.next[1];
              } else {
                obj.processes[i].task = obj.processes[i].task.next.next[0];
              }
            } else {
              obj.processes[i].task = obj.processes[i].task.next;
            }

            obj.processes[i].curDuration = 1;
            obj.processes[i].duration = obj.processes[i].task.duration;
            //console.log(obj.processes);
          } else {
            console.log("Increase");
            obj.processes[i].curDuration += 1;
            //console.log("[Increment]", obj.processes[i].curDuration);
          }
        }
      }
      //console.log(obj.processes);
    }
  }
}
const supplier = new Agent(
  "supplier",
  25,
  25,
  [
    {
      name: "apple",
      quantity: 100,
      price: 50,
      cost: 40,
    },
    {
      name: "pearl",
      quantity: 200,
      price: 60,
      cost: 20,
    },
  ],
  null,
  AgentType.Supplier
);
const distributor = new Agent(
  "distributor",
  24,
  24,
  [
    {
      name: "apple",
      quantity: 100,
      price: 50,
      cost: 40,
    },
    {
      name: "pearl",
      quantity: 200,
      price: 60,
      cost: 20,
    },
  ],
  null,
  AgentType.Distributor
);
const customer1 = new Agent(
  "customer1",
  23,
  23,
  [
    {
      name: "apple",
      quantity: 100,
      price: 50,
      cost: 40,
    },
    {
      name: "pearl",
      quantity: 200,
      price: 60,
      cost: 20,
    },
  ],
  null,
  AgentType.Customer
);
const customer2 = new Agent(
  "customer2",
  24,
  25,
  [
    {
      name: "apple",
      quantity: 100,
      price: 50,
      cost: 40,
    },
    {
      name: "pearl",
      quantity: 200,
      price: 60,
      cost: 20,
    },
  ],
  null,
  AgentType.Customer
);
const customer3 = new Agent(
  "customer3",
  9,
  25,
  [
    {
      name: "apple",
      quantity: 100,
      price: 50,
      cost: 40,
    },
    {
      name: "pearl",
      quantity: 200,
      price: 60,
      cost: 20,
    },
  ],
  null
);

const t1 = new Transportation("Truck", supplier, distributor, 300, []);

const start1 = new Event(
  "receive order",
  null,
  1,
  EventType.Start,
  EventStartType.Message,
  2
);
//start1.canStart = true;
const ac1 = new Activity("load", null, 3, [
  () => {
    //console.log("loading");
    for (let i = 0; i < supplier.inventory.length; i++) {
      //skip quantity on object
      const temp = (({ quantity, ...others }) => others)(supplier.inventory[i]);
      t1.load(temp, 40);
    }
  },
]);
const ac2 = new Activity("ship", null, 4, [t1.move]);
const end1 = new Event(
  "close order",
  null,
  0,
  EventType.End,
  EventStartType.Auto,
  2
);
start1.next = ac1;
ac1.next = ac2;
ac2.next = end1;
supplier.startEvent = start1;
const start2 = new Event(
  "Open Store",
  null,
  1,
  EventType.Start,
  EventStartType.Timer,
  2
);
const multi = new Gateway("Multi", [], GatewayType.Parallel);
const instant1 = new Event(
  "Receive shipment",
  null,
  1,
  EventType.Intermediate,
  EventStartType.Message,
  2
);
const ac3 = new Activity("Unload", null, 4, [
  () => {
    t1.unload(t1.cargo[0].item, t1.cargo[0].quantity);
    t1.unload(t1.cargo[0].item, t1.cargo[0].quantity);
  },
]);
const ac4 = new Activity("Sell", null, 1, []);
const condition1 = new Gateway("Condition", [], GatewayType.Exclusive);
const condition2 = new Gateway("Stuck", [], GatewayType.Exclusive);
const ac5 = new Activity("Place Order", null, 1, []);
const end2 = new Event(
  "close Order",
  null,
  0,
  EventType.End,
  EventStartType.Auto,
  2
);
const end3 = new Event(
  "Close Store",
  null,
  0,
  EventType.End,
  EventStartType.Auto,
  2
);
start2.next = multi;
multi.next.push(instant1);
multi.next.push(ac4);
instant1.next = ac3;
ac3.next = end2;
ac4.next = condition1;
condition1.next.push(ac4);
condition1.next.push(ac5);
condition2.next.push(end3);
condition2.next.push(ac5);
ac5.throw = supplier;
ac5.throwEvent = start1;
ac5.next = end3;
ac2.throw = distributor;
ac2.throwEvent = instant1;

distributor.startEvent = start2;
const start3 = new Event(
  "star 3",
  null,
  0,
  EventType.Start,
  EventStartType.Timer,
  2
);
const start4 = new Event(
  "star 4",
  null,
  0,
  EventType.Start,
  EventStartType.Timer,
  0
);
const aciti1 = new Activity("load", null, 3, [
  () => {
    console.log("loading 1");
  },
]);
const aciti2 = new Activity("load", null, 3, [
  () => {
    console.log("loading 2");
  },
]);
const end5 = new Event(
  "close Order",
  null,
  0,
  EventType.End,
  EventStartType.Auto,
  2
);
const end6 = new Event(
  "close Order",
  null,
  0,
  EventType.End,
  EventStartType.Auto,
  2
);
start3.next = aciti1;
aciti1.next = end5;
start4.next = aciti2;
aciti2.next = end6;
aciti1.throw = supplier;
aciti2.throw = supplier;
aciti1.throwEvent = start1;
aciti2.throwEvent = start1;

customer1.startEvent = start3;
customer2.startEvent = start4;

var g = new Graph(4);
var vertices = [supplier, distributor, customer1, customer2];

// adding vertices
for (var i = 0; i < vertices.length; i++) {
  g.addVertex(new Node(i, vertices[i]));
}

g.addEdge(0, 1);
g.addEdge(1, 2);
g.addEdge(1, 3);

export {
  Transportation,
  Agent as Participant,
  supplier,
  distributor,
  customer1,
  customer2,
  customer3,
  Event,
  Gateway,
  Activity,
  EventType,
  EventStartType,
  GatewayType,
  t1,
  g,
};
