import { Component, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { PageService } from '../page.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['../../admin-common-style.css', './pages.component.css'],
  providers: [PageService]
})
export class PagesComponent implements OnInit, AfterViewInit, OnDestroy {
  firebaseSubscription: Subscription = null;
  displayedColumns = ['pageTitle' , 'url' , 'edit', 'delete'];
  dataSource = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  pages = [];
  loading = true;
  pageTitle: string;

  constructor(
    private pageService: PageService,
    public translate: TranslateService
  ) {
    this.translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    this.translate.get('admin.genericPages.pageTitle')
      .toPromise()
      .then(pageTitle => {
        this.pageTitle = pageTitle;
    });
    this.firebaseSubscription = this.pageService.getPagesList().subscribe(pages => {
      this.pages = pages;
      this.dataSource.data = this.pages;
      this.loading = false;
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  deletePage(pageMetadata): void {
    this.translate.get('admin.genericPages.confirmDelete').toPromise().then(confirmString => {
      const result = confirm(`${confirmString} "${pageMetadata.title}"?`);
      if (result) {
        this.pageService.deletePage(pageMetadata).then(() => {
          console.log('deleted successfully: ', pageMetadata);
        }).catch((err) => {
          console.log('Failed to Delete with Error:', err);
        });
      } else {
        console.log('canceled');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.firebaseSubscription) {
      this.firebaseSubscription.unsubscribe();
    }
  }
}
