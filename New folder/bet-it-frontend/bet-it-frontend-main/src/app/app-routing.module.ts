import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {FiltersComponent} from "./components/filters/filters.component";
import {AuthService} from "./services/auth.service";

const routes: Routes = [
  {path: "", component: DashboardComponent},
  {path: "filters", component: FiltersComponent, canActivate: [AuthService]},
  {path: "**", pathMatch: "full", redirectTo: "/"}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
