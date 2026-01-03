-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: dataforml
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cart_item`
--

DROP TABLE IF EXISTS `cart_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_item` (
  `cart_itemid` bigint NOT NULL AUTO_INCREMENT,
  `customerid` bigint NOT NULL,
  `itemid` bigint NOT NULL,
  `quantity` int DEFAULT NULL,
  `added_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`cart_itemid`),
  KEY `customerid_idx` (`customerid`),
  KEY `itemid_idx` (`itemid`),
  CONSTRAINT `fk_cart_item_customer` FOREIGN KEY (`customerid`) REFERENCES `customer` (`customerid`),
  CONSTRAINT `fk_cart_item_item` FOREIGN KEY (`itemid`) REFERENCES `item` (`itemid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=181 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_item`
--

LOCK TABLES `cart_item` WRITE;
/*!40000 ALTER TABLE `cart_item` DISABLE KEYS */;
INSERT INTO `cart_item` VALUES (3,4,20,1,'2025-10-18 08:47:29'),(4,5,11,3,'2025-10-18 08:47:29'),(5,6,45,1,'2025-10-18 08:47:29'),(6,7,30,2,'2025-10-18 08:47:29'),(7,7,31,1,'2025-10-18 08:47:29'),(8,10,12,5,'2025-10-18 08:47:29'),(9,11,50,1,'2025-10-18 08:47:29'),(10,15,22,1,'2025-10-18 08:47:29'),(11,18,17,2,'2025-10-18 08:47:29'),(12,19,35,1,'2025-10-18 08:47:29'),(13,20,40,2,'2025-10-18 08:47:29'),(14,21,10,1,'2025-10-18 08:47:29'),(15,22,11,4,'2025-10-18 08:47:29');
/*!40000 ALTER TABLE `cart_item` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-19 18:31:31
