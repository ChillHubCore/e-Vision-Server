import express from "express";
import expressAsyncHandler from "express-async-handler";
import { isAdmin, isAuth, isCreator } from "../utils.js";
import Promotion from "../models/promotionModel.js";

const promotionRoutes = express.Router();

promotionRoutes.get(
  "/",
  isAuth,
  isCreator,
  expressAsyncHandler(async (req, res) => {
    const {
      id,
      promotionIdentifier,
      active,
      activeFrom,
      activeUntil,
      desc = "false",
    } = req.query;
    const searchQuery = {};
    if (id) {
      searchQuery._id = id;
    }
    if (active) {
      searchQuery.active = active;
    }
    if (promotionIdentifier) {
      searchQuery.promotionIdentifier = {
        $regex: promotionIdentifier,
        $options: "i",
      };
    }
    if (activeFrom || activeUntil) {
      searchQuery.createdAt = {};
      if (activeFrom) {
        searchQuery.createdAt.$gte = new Date(activeFrom);
      }
      if (activeUntil) {
        searchQuery.createdAt.$lte = new Date(activeUntil);
      }
    }

    try {
      const promotions = await Promotion.find(searchQuery).sort({
        createdAt: desc === "true" ? -1 : 1,
      });

      res.send(promotions);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  }),
);

promotionRoutes.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const {
        promotionIdentifier,
        description,
        active,
        activeFrom,
        activeUntil,
        usageCap,
        maximumDiscount,
        minTotalOrder,
        applicableProducts,
      } = req.body.values;
      const promotion = new Promotion({
        promotionIdentifier,
        description,
        active,
        activeFrom: new Date(activeFrom),
        activeUntil: new Date(activeUntil),
        usageCap,
        maximumDiscount,
        minTotalOrder,
        applicableProducts,
        creator: req.user._id,
      });
      const createdPromotion = await promotion.save();
      res.send({ message: "Promotion Created", promotion: createdPromotion });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  }),
);

promotionRoutes.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const promotionId = req.params.id;
      const {
        promotionIdentifier,
        description,
        active,
        activeFrom,
        activeUntil,
        usageCap,
        maximumDiscount,
        minTotalOrder,
        applicableProducts,
      } = req.body.values;
      const promotion = await Promotion.findById(promotionId);
      if (promotion) {
        promotion.promotionIdentifier =
          promotionIdentifier || promotion.promotionIdentifier;
        promotion.description = description || promotion.description;
        promotion.active = active || promotion.active;
        promotion.activeFrom = new Date(activeFrom) || promotion.activeFrom;
        promotion.activeUntil = new Date(activeUntil) || promotion.activeUntil;
        promotion.usageCap = usageCap || promotion.usageCap;
        promotion.maximumDiscount =
          maximumDiscount || promotion.maximumDiscount;
        promotion.minTotalOrder = minTotalOrder || promotion.minTotalOrder;
        promotion.applicableProducts =
          applicableProducts || promotion.applicableProducts;
        const updatedPromotion = await promotion.save();
        res.send({ message: "Promotion Updated", promotion: updatedPromotion });
      } else {
        res.status(404).send({ message: "Promotion Not Found" });
      }
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  }),
);

promotionRoutes.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const promotionId = req.params.id;
      const promotion = await Promotion.findById(promotionId);
      if (promotion) {
        const deletedPromotion = await promotion.remove();
        res.send({ message: "Promotion Deleted", promotion: deletedPromotion });
      } else {
        res.status(404).send({ message: "Promotion Not Found" });
      }
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  }),
);

export default promotionRoutes;
