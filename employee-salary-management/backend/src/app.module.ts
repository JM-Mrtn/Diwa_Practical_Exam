import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmployeesModule } from "./employees/employees.module";
import { SalariesModule } from "./salaries/salaries.module";
import { SalaryComponentsModule } from "./salary-components/salary-components.module";
import { SalaryRatesModule } from "./salary-rates/salary-rates.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres" as const,
        host: config.get<string>("DB_HOST", "localhost"),
        port: Number(config.get("DB_PORT", "5432")),
        username: config.get<string>("DB_USERNAME", "postgres"),
        password: config.get<string>("DB_PASSWORD", "postgres"),
        database: config.get<string>("DB_NAME", "employee_salary_db"),
        autoLoadEntities: true,
        synchronize: config.get("DB_SYNCHRONIZE", "false") === "true",
      }),
    }),
    EmployeesModule,
    SalariesModule,
    SalaryComponentsModule,
    SalaryRatesModule,
  ],
})
export class AppModule {}
