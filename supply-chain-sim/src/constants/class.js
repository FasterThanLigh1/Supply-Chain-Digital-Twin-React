import { RunState } from ".";
import { runShipment } from "./callback";

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
  constructor() {
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
  getLength() {
    return this.AdjList.length;
  }
  printGraph() {
    // get all the vertices
    for (let i = 0; i < this.getLength(); i++) {
      //console.log("Node: ", this.AdjList[i]);
    }
  }
}
class Agent {
  constructor(name, x, y, inventory, startEvent, type, id) {
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
    this.transport = [];
    this.route = null;
    this.runState = RunState.CanRun;
    this.taskList = [];
    this.id = id;
    this.customerDemand = [];
    this.demand = [];
    this.backOrder = [];
    this.prev = null;
  }
  /* addBulk(cargo) {
    for (let i = 0; i < cargo.length; i++) {
      this.addInventory(cargo[i]);
    }
  } */
  addInventory(item, quantity) {
    console.log("Before:", this.inventory, " and ", item);
    for (let i = 0; i < this.inventory.length; i++) {
      if (this.inventory[i].name === item.name) {
        this.inventory[i].quantity += quantity;
      }
    }
    console.log("After:", this.inventory);
  }
  removeInventory(item, quantity) {
    console.log("Before:", this.inventory, " and ", item);
    for (let i = 0; i < this.inventory.length; i++) {
      if (this.inventory[i].name === item.name) {
        if (this.inventory[i].quantity == 0) {
          alert(`stock out for ${this.inventory[i].name}`);
          return {
            name: item.name,
            quantity: 0,
          };
        }
        const temp = this.inventory[i].quantity - quantity;
        if (temp < 0) {
          console.log(
            "Not enough in inventory and added to backlog " + this.name
          );
          const itemToAdd = {
            name: item.name,
            quantity: this.inventory[i].quantity,
          };
          this.backOrder.push({
            name: item.name,
            quantity: temp * -1,
          });
          this.inventory[i].quantity = 0;
          return itemToAdd;
        } else {
          this.inventory[i].quantity = temp;
          return {
            name: item.name,
            quantity: quantity,
          };
        }
      }
    }
    console.log("After:", this.inventory);
    return true;
  }
  load(obj) {
    console.log(this.name);
    console.log(this.inventory);
    for (let i = 0; i < obj.customerDemand.length; i++) {
      console.log(obj.customerDemand);
      obj.customerDemand[i].transport.loadBulk(obj.customerDemand[i].demand);
    }
    obj.runState = RunState.CanRun;
  }
  unload(obj) {
    console.log(obj);
    for (let i = 0; i < obj.transport.length; i++) {
      if (obj.transport[i].cargo.length == 0) {
        console.log("No cargo ?");
        return;
      }
      for (let j = 0; j < obj.transport[i].cargo.length; j++) {
        obj.transport[i].unload(
          obj.transport[i].cargo[j],
          obj.transport[i].cargo[j].quantity
        );
      }
      //clear cargo
      obj.transport[i].cargo.length = 0;
    }
    obj.runState = RunState.CanRun;
  }
  unload2(obj) {
    console.log(obj);
    for (let i = 0; i < obj.transport.length; i++) {
      if (obj.transport[i].cargo.length == 0) {
        console.log("No cargo ?");
        return;
      }
      for (let j = 0; j < obj.transport[i].cargo.length; j++) {
        obj.transport[i].unload(
          obj.transport[i].cargo[j],
          obj.transport[i].cargo[j].quantity
        );
      }
      //clear cargo
      obj.transport[i].cargo.length = 0;
    }
    obj.runState = RunState.CanRun;
  }
  checkDemand(obj) {
    for (let i = 0; i < obj.customerDemand.length; i++) {
      console.log("[Demand]", obj.customerDemand[i]);
    }
  }
  move(obj) {
    console.log(obj);
    for (let i = 0; i < obj.transport.length; i++) {
      obj.transport[i].move();
    }
    const id = "peep" + this.name;
    runShipment(obj.route, id, obj, [
      () => {
        console.log("Finish shipment");
      },
    ]);
    console.log(this.transport);
  }
  print(obj) {
    console.log(obj.name);
    obj.runState = RunState.CanRun;
  }
  printWhole(obj) {
    console.log(obj);
    obj.inventory[0].name = "gy";
    obj.runState = RunState.CanRun;
  }
}
class BpmnNode {
  constructor(name, next, duration, id) {
    this.name = name;
    this.next = next;
    this.duration = duration;
    this.id = id;
    this.trigger = null;
    this.throw = null;
    this.throwEvent = null;
    this.actionCallback = [];
    this.deliveryOnCallback = [];
    this.hasRun = false;
  }
  run(obj) {
    console.log(this.name);
    if (this.hasRun) {
      console.log("has run and run only once");
      obj.runState = RunState.CanRun;
      return;
    } else {
      this.hasRun = true;
    }
    if (this.actionCallback != null) {
      for (let i = 0; i < this.actionCallback.length; i++) {
        this.actionCallback[i](obj);
      }
    }
  }
}
class Event extends BpmnNode {
  constructor(
    name,
    next,
    duration,
    type,
    startType,
    startTime,
    actionCallback,
    id
  ) {
    super(name, next, duration, id);
    this.type = type;
    this.startType = startType;
    //this.canStart = false;
    this.multiple = false;
    this.startTime = startTime;
    this.actionCallback = actionCallback;
  }
}
class Gateway extends BpmnNode {
  constructor(name, next, type, actionCallback, id) {
    super(name, next, 0, id);
    this.type = type;
    this.actionCallback = actionCallback;
  }
}
class Activity extends BpmnNode {
  constructor(name, next, duration, actionCallback, id) {
    super(name, next, duration, id);
    this.actionCallback = actionCallback;
  }
  addCallBack(actionCallback) {
    this.actionCallback.push(actionCallback);
  }
}

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
    const temp = this.src.removeInventory(item, quantity);
    console.log("Capacity before: ", this.curCapacity, this.capacity);
    if (this.curCapacity + temp.quantity >= this.capacity) {
      alert("Not enough capacity to load !");
      return;
    }
    console.log("current capacity:", this.curCapacity, temp);
    this.curCapacity += temp.quantity;
    this.cargo.push(temp);
    console.log("Capacity after: ", this.curCapacity, this.capacity);
    console.log("Back log: ", this.src.backOrder);
  }
  loadBulk(items) {
    if (this.src.backOrder.length > 0) {
      for (let i = 0; i < this.src.backOrder.length; i++) {
        this.load(this.src.backOrder[i], this.src.backOrder[i].quantity);
        this.src.backOrder.splice(i, 1);
        i--;
      }
    }
    for (let i = 0; i < items.length; i++) {
      this.load(items[i], items[i].quantity);
    }
  }
  unload(item, quantity, obj) {
    console.log("Unload");
    console.log(item);
    this.curCapacity -= quantity;
    this.des.addInventory(item, quantity);
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

export { Node, Graph, Agent, Event, Activity, Gateway, Transportation };
