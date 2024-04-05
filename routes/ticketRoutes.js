import express from "express";
import expressAsyncHandler from "express-async-handler";
import { isAdmin, isAuth, isCreator, isSupport } from "../utils.js";
import Ticket from "../models/ticketModel.js";

const ticketRoutes = express.Router();

ticketRoutes.get(
  "/",
  isAuth,
  isSupport,
  expressAsyncHandler(async (req, res) => {
    const {
      id,
      createdBy,
      assignedTo,
      closedBy,
      status,
      ticketType,
      timeCreatedGTE,
      timeCreatedLTE,
      desc = "false",
    } = req.query;
    const searchQuery = {};
    if (id) {
      searchQuery._id = id;
    }
    if (status) {
      searchQuery.status = status;
    }
    if (ticketType) {
      searchQuery.ticketType = ticketType;
    }

    if (timeCreatedGTE || timeCreatedLTE) {
      searchQuery.createdAt = {};
      if (timeCreatedGTE) {
        searchQuery.createdAt.$gte = new Date(timeCreatedGTE);
      }
      if (timeCreatedLTE) {
        searchQuery.createdAt.$lte = new Date(timeCreatedLTE);
      }
    }

    try {
      const tickets = await Ticket.find(searchQuery)
        .populate("createdBy", "username _id")
        .populate("assignedTo", "username _id");

      res.send(sortedFilteredTickets);
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  }),
);

ticketRoutes.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const {
        title,
        description,
        attachments,
        ticketType,
        status,
        priority,
        assignedTo,
      } = req.body.values;
      const ticket = new Ticket({
        title,
        description,
        attachments,
        ticketType,
        status,
        priority,
        createdBy: req.user._id,
        assignedTo,
      });
      const createdTicket = await ticket.save();
      res.status(201).send(createdTicket);
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  }),
);

ticketRoutes.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const ticket = await Ticket.findById(req.params.id);
      if (ticket) {
        ticket.status = req.body.values.status || ticket.status;
        ticket.priority = req.body.values.priority || ticket.priority;
        ticket.assignedTo = req.body.values.assignedTo || ticket.assignedTo;
        ticket.ticketType = req.body.values.ticketType || ticket.ticketType;

        const updatedTicket = await ticket.save();
        res.send(updatedTicket);
      } else {
        res.status(404).send({ message: "Ticket not found" });
      }
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  }),
);

ticketRoutes.patch(
  "/close/:id",
  isAuth,
  isSupport,
  expressAsyncHandler(async (req, res) => {
    try {
      const ticket = await Ticket.findById(req.params.id);
      if (ticket) {
        ticket.status = "Closed";
        ticket.closedBy = req.user._id;
        ticket.closedAt = new Date();
        ticket.closedNote = req.body.closedNote;
        const updatedTicket = await ticket.save();
        res.send(updatedTicket);
      } else {
        res.status(404).send({ message: "Ticket not found" });
      }
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  }),
);

ticketRoutes.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const ticket = await Ticket.findById(req.params.id);
      if (ticket) {
        const deletedTicket = Ticket.findByIdAndDelete(req.params.id);
        res.send(deletedTicket);
      } else {
        res.status(404).send({ message: "Ticket not found" });
      }
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  }),
);

export default ticketRoutes;
