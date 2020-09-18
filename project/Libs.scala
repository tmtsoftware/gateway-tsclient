import sbt._

object Libs {
  val ScalaVersion = "2.13.3"

  val `scalaTest`         = "org.scalatest"                            %% "scalatest"         % "3.2.2" //Apache License 2.0
  val `selenium-java`     = "org.seleniumhq.selenium"                   % "selenium-java"     % "3.141.59"
  val `embedded-keycloak` = "com.github.tmtsoftware.embedded-keycloak" %% "embedded-keycloak" % "7fd5623"
  val `webdriverManager`  = "io.github.bonigarcia"                      % "webdrivermanager"  % "4.2.0"
  val `tmt-test-reporter` = "com.github.tmtsoftware"                   %% "rtm"               % "05e9789f460"
  val scalaTestPlus       = "org.scalatestplus"                        %% "selenium-3-141"    % "3.2.2.0"
}

object CSW {
  val Version: String = {
    val env = sys.env ++ sys.props
    env.getOrElse("CSW_VERSION", "51ef279e24b1e")
  }

  val `csw-location-server` = "com.github.tmtsoftware.csw" %% "csw-location-server" % Version
  val `csw-config-server`   = "com.github.tmtsoftware.csw" %% "csw-config-server"   % Version
}
