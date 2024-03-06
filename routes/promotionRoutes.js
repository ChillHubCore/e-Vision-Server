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
      timeCreatedGTE,
      timeCreatedLTE,
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
    if (activeFrom) {
      searchQuery.activeFrom = new Date(activeFrom);
    }
    if (activeUntil) {
      searchQuery.activeUntil = new Date(activeUntil);
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
      const promotions = await Promotion.find(searchQuery)
        .populate("applicableProducts.product")
        .sort({
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
      console.log(req.body);
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
        accessibleRoles,
        percentageDiscount,
        fixedDiscount,
      } = req.body.values;

      const promotion = new Promotion({
        promotionIdentifier,
        description,
        active,
        activeFrom: new Date(activeFrom),
        activeUntil: new Date(activeUntil),
        usageCap,
        maximumDiscount,
        accessibleRoles,
        minTotalOrder,
        applicableProducts,
        percentageDiscount,
        fixedDiscount,
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
        percentageDiscount,
        fixedDiscount,
      } = req.body.values;
      const promotion = await Promotion.findById(promotionId);
      if (promotion) {
        const updatedPromotion = await Promotion.findByIdAndUpdate(
          {
            _id: promotionId,
          },
          {
            promotionIdentifier:
              promotionIdentifier !== undefined
                ? promotionIdentifier
                : promotion.promotionIdentifier,
            description:
              description !== undefined ? description : promotion.description,
            active: active !== undefined ? active : promotion.active,
            activeFrom:
              activeFrom !== undefined
                ? new Date(activeFrom)
                : promotion.activeFrom,
            activeUntil:
              activeUntil !== undefined
                ? new Date(activeUntil)
                : promotion.activeUntil,
            usageCap: usageCap !== undefined ? usageCap : promotion.usageCap,
            maximumDiscount:
              maximumDiscount !== undefined
                ? maximumDiscount
                : promotion.maximumDiscount,
            minTotalOrder:
              minTotalOrder !== undefined
                ? minTotalOrder
                : promotion.minTotalOrder,
            applicableProducts:
              applicableProducts !== undefined
                ? applicableProducts
                : promotion.applicableProducts,
            percentageDiscount:
              percentageDiscount !== undefined
                ? percentageDiscount
                : promotion.percentageDiscount,
            fixedDiscount:
              fixedDiscount !== undefined
                ? fixedDiscount
                : promotion.fixedDiscount,
          },
          { new: true },
        );
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
        const deletedPromotion = await Promotion.findByIdAndDelete(promotionId);
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
