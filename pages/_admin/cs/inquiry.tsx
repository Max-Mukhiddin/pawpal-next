import React, { useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Box, InputAdornment, Stack } from '@mui/material';
import { List, ListItem } from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TabContext } from '@mui/lab';
import OutlinedInput from '@mui/material/OutlinedInput';
import AdminListPagination from '../../../libs/components/admin/AdminListPagination';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { InquiryList } from '../../../libs/components/admin/cs/InquiryList';

const InquiryArticles: NextPage = (props: any) => {
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);

	/** APOLLO REQUESTS **/
	/** LIFECYCLES **/
	/** HANDLERS **/

	return (
		<Box component={'div'} className={'content'}>
			<Typography variant="h2" className="admin-page-title">
				1:1 Inquiry Management
			</Typography>
			<Box component="div" className="admin-table-card table-wrap">
				<Box component={'div'} sx={{ width: '100%', typography: 'body1' }}>
					<TabContext value={'value'}>
						<Box component={'div'}>
							<List className="admin-filter-tabs tab-menu">
								<ListItem
									// onClick={(e) => handleTabChange(e, 'all')}
									value="all"
									className={'all' === 'all' ? 'li on' : 'li'}
								>
									All (0)
								</ListItem>
								<ListItem
									// onClick={(e) => handleTabChange(e, 'active')}
									value="active"
									className={'all' === 'all' ? 'li on' : 'li'}
								>
									Active (0)
								</ListItem>
								<ListItem
									// onClick={(e) => handleTabChange(e, 'blocked')}
									value="blocked"
									className={'all' === 'all' ? 'li on' : 'li'}
								>
									Blocked (0)
								</ListItem>
								<ListItem
									// onClick={(e) => handleTabChange(e, 'deleted')}
									value="deleted"
									className={'all' === 'all' ? 'li on' : 'li'}
								>
									Deleted (0)
								</ListItem>
							</List>
							<Divider />
							<Stack className="admin-toolbar search-area" sx={{ m: '24px' }} direction="row" alignItems="center" flexWrap="wrap" useFlexGap>
								<Select className="admin-select" sx={{ minWidth: 160 }} value={'searchCategory'} displayEmpty renderValue={() => 'All Categories'}>
									<MenuItem value={'searchCategory'} disabled>
										All Categories
									</MenuItem>
								</Select>

								<OutlinedInput
									value={''}
									sx={{ width: '100%', flex: '1 1 280px' }}
									className="admin-search search"
									placeholder="Search inquiries..."
									onKeyDown={(event) => {
										// if (event.key == 'Enter') searchTargetHandler().then();
									}}
									endAdornment={
										<>
											{true && <CancelRoundedIcon onClick={() => {}} />}
											<InputAdornment position="end" onClick={() => {}}>
												<img src="/img/icons/search_icon.png" alt={'searchIcon'} />
											</InputAdornment>
										</>
									}
								/>
							</Stack>
							<Divider />
						</Box>
						<InquiryList
							// dense={dense}
							// membersData={membersData}
							// searchMembers={searchMembers}
							anchorEl={anchorEl}
							// handleMenuIconClick={handleMenuIconClick}
							// handleMenuIconClose={handleMenuIconClose}
							// generateMentorTypeHandle={generateMentorTypeHandle}
						/>

						<AdminListPagination count={4} rowsPerPage={10} page={1} onPageChange={() => {}} onRowsPerPageChange={() => {}} />
					</TabContext>
				</Box>
			</Box>
		</Box>
	);
};

export default withAdminLayout(InquiryArticles);
