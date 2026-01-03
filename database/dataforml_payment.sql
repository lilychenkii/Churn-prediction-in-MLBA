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
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `paymentid` bigint NOT NULL AUTO_INCREMENT,
  `customerid` bigint NOT NULL,
  `orderid` bigint NOT NULL,
  `method` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `transaction_date` timestamp NULL DEFAULT NULL,
  `txn_ref` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`paymentid`),
  KEY `fk_payment_customer_idx` (`customerid`),
  KEY `fk_payment_order_idx` (`orderid`),
  CONSTRAINT `fk_payment_customer` FOREIGN KEY (`customerid`) REFERENCES `customer` (`customerid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_payment_order` FOREIGN KEY (`orderid`) REFERENCES `order` (`orderid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
INSERT INTO `payment` VALUES (1,14,46,'bank',2030000.00,'pending','2025-10-19 06:45:28','SIPSWEET 46'),(2,14,47,'cod',65000.00,'completed','2025-10-19 07:28:49',NULL),(3,14,48,'bank',70000.00,'pending','2025-10-19 07:29:18','SIPSWEET 48'),(4,14,49,'cod',225000.00,'completed','2025-10-19 07:41:49',NULL),(5,14,50,'bank',140000.00,'pending','2025-10-19 07:42:57','SIPSWEET 50'),(6,14,51,'bank',425000.00,'pending','2025-10-19 07:57:50','SIPSWEET 51'),(7,14,52,'bank',395000.00,'pending','2025-10-19 08:14:58','SIPSWEET 52'),(8,14,53,'bank',323250.00,'pending','2025-10-19 08:34:35','SIPSWEET 53'),(9,14,54,'bank',365000.00,'pending','2025-10-19 08:37:10','SIPSWEET 54'),(10,14,55,'bank',435000.00,'pending','2025-10-19 08:49:37','SIPSWEET 55'),(11,14,56,'bank',106500.00,'pending','2025-10-19 09:02:58','SIPSWEET 56'),(12,14,57,'cod',55000.00,'completed','2025-10-19 09:03:54',NULL),(13,14,58,'bank',415000.00,'pending','2025-10-19 09:11:44','SIPSWEET 58'),(14,14,59,'bank',342000.00,'pending','2025-10-19 09:16:27','SIPSWEET 59'),(15,14,60,'cod',120000.00,'completed','2025-10-19 09:24:47',NULL),(16,14,61,'bank',310000.00,'pending','2025-10-19 09:48:49','SIPSWEET 61'),(17,3,62,'bank',340000.00,'pending','2025-10-19 09:58:43','SIPSWEET 62'),(18,3,63,'bank',345000.00,'pending','2025-10-19 10:08:55','SIPSWEET 63'),(19,14,64,'cod',295000.00,'completed','2025-10-19 10:10:34',NULL),(20,14,65,'bank',85000.00,'pending','2025-10-19 10:25:54','SIPSWEET 65'),(21,3,66,'bank',220000.00,'pending','2025-10-19 10:32:28','SIPSWEET 66'),(22,14,67,'cod',115000.00,'completed','2025-10-19 10:36:55',NULL),(23,3,68,'bank',245000.00,'pending','2025-10-19 11:22:14','SIPSWEET 68'),(24,3,69,'bank',75000.00,'pending','2025-10-19 11:26:07','SIPSWEET 69'),(25,23,70,'cod',310000.00,'completed','2025-10-19 11:28:08',NULL);
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
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
