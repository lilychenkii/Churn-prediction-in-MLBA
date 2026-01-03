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
-- Table structure for table `churn_prediction`
--

DROP TABLE IF EXISTS `churn_prediction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `churn_prediction` (
  `predictionid` bigint NOT NULL AUTO_INCREMENT,
  `customerid` bigint NOT NULL,
  `churn_probability` decimal(5,4) DEFAULT NULL,
  `risk_band` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `rcm_action` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `action_sent` tinyint DEFAULT NULL,
  `snapshot_date` date DEFAULT NULL,
  PRIMARY KEY (`predictionid`),
  KEY `customerid_idx` (`customerid`),
  CONSTRAINT `fk_churn_prediction_customer` FOREIGN KEY (`customerid`) REFERENCES `customer` (`customerid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `churn_prediction`
--

LOCK TABLES `churn_prediction` WRITE;
/*!40000 ALTER TABLE `churn_prediction` DISABLE KEYS */;
INSERT INTO `churn_prediction` VALUES (1,17,0.0512,'Low','No action',0,'2025-10-18'),(2,10,0.1500,'Low','Send survey',1,'2025-10-18'),(3,5,0.4500,'Medium','Send 10% discount voucher',1,'2025-10-18'),(4,6,0.8200,'High','Personalized follow-up call',0,'2025-10-18'),(5,15,0.9150,'Very High','Offer loyalty points + Call',0,'2025-10-18'),(6,8,0.0200,'Low','No action',0,'2025-10-18'),(7,12,0.3300,'Medium','Send 10% discount voucher',1,'2025-10-18'),(8,4,0.6700,'High','Offer 20% discount',0,'2025-10-18'),(9,11,0.1120,'Low','Send survey',1,'2025-10-18'),(10,9,0.5500,'Medium','Send 15% discount voucher',0,'2025-10-18'),(11,21,0.7500,'High','Personalized follow-up call',1,'2025-10-18'),(12,14,0.0850,'Low','No action',0,'2025-10-18'),(13,7,0.2200,'Medium','Send 10% discount voucher',0,'2025-10-18'),(14,16,0.9500,'Very High','Offer loyalty points + Call',1,'2025-10-18'),(15,3,0.4900,'Medium','Send 10% discount voucher',1,'2025-10-18');
/*!40000 ALTER TABLE `churn_prediction` ENABLE KEYS */;
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
